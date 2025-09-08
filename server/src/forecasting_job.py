import os
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window, count, to_json, struct, format_string, round as spark_round, \
    split
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType, IntegerType
from sklearn.linear_model import LinearRegression

load_dotenv()

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
INPUT_TOPIC = "rides"
OUTPUT_TOPIC = "predictions"


# Pandas UDF for prediction
def predict_demand(pdf: pd.DataFrame) -> pd.DataFrame:
    pdf = pdf.sort_values(by='timestamp')
    if len(pdf) < 2:
        predicted_count = pdf['count'].iloc[-1] if not pdf.empty else 0
    else:
        X = np.array(pdf['timestamp'].astype('int64') // 10 ** 9).reshape(-1, 1)
        y = pdf['count'].values
        model = LinearRegression()
        model.fit(X, y)
        last_timestamp = X[-1][0]
        next_timestamp = last_timestamp + 60  # next minute
        predicted_count = max(0, int(model.predict(np.array([[next_timestamp]]))[0]))

    # Use last row as template
    result = pdf.iloc[-1:].copy()
    result['predicted_count'] = predicted_count
    return result[['cellId', 'lat', 'lng', 'predicted_count']]


def main():
    spark = SparkSession.builder \
        .appName("TaxiDemandForecasting") \
        .getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    schema = StructType([
        StructField("lat", DoubleType(), True),
        StructField("lng", DoubleType(), True),
        StructField("ts", TimestampType(), True)
    ])

    df = spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS) \
        .option("subscribe", INPUT_TOPIC) \
        .option("startingOffsets", "latest") \
        .load()

    ride_df = df.select(from_json(col("value").cast("string"), schema).alias("data")).select("data.*")

    # Assign cells
    ride_df = ride_df.withColumn(
        "cellId",
        format_string("%s_%s", spark_round(col("lat"), 3), spark_round(col("lng"), 3))
    )

    # Aggregate per window
    windowed_counts = ride_df.withWatermark("ts", "10 minutes") \
        .groupBy(window(col("ts"), "1 minute", "30 seconds"), col("cellId")) \
        .agg(count("*").alias("count")) \
        .select(
        col("window.start").alias("timestamp"),
        col("cellId"),
        col("count")
    )

    # Add lat/lng back
    windowed_counts = windowed_counts \
        .withColumn("lat", split(col("cellId"), "_").getItem(0).cast(DoubleType())) \
        .withColumn("lng", split(col("cellId"), "_").getItem(1).cast(DoubleType()))

    # Apply Pandas UDF per cellId
    from pyspark.sql.functions import pandas_udf
    prediction_schema = StructType([
        StructField("cellId", StringType()),
        StructField("lat", DoubleType()),
        StructField("lng", DoubleType()),
        StructField("predicted_count", IntegerType())
    ])

    @pandas_udf(prediction_schema)
    def predict_demand_udf(pdf: pd.DataFrame) -> pd.DataFrame:
        return predict_demand(pdf)

    # Predict per cellId
    prediction_stream = windowed_counts.groupBy("cellId").apply(predict_demand_udf)

    # Write to Kafka
    query = prediction_stream.select(to_json(struct(col("*"))).alias("value")) \
        .writeStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS) \
        .option("topic", OUTPUT_TOPIC) \
        .option("checkpointLocation", "/tmp/spark-checkpoints/forecasting") \
        .outputMode("update") \
        .start()

    query.awaitTermination()


if __name__ == "__main__":
    main()
