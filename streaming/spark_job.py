from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, DoubleType, LongType


spark = SparkSession.builder.appName("TaxiDemand").getOrCreate()


schema = StructType([
    StructField("lat", DoubleType()),
    StructField("lng", DoubleType()),
    StructField("ts", LongType())
])


rides = spark.readStream.format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "rides") \
    .load()


parsed = rides.select(from_json(col("value").cast("string"), schema).alias("ride"))


agg = parsed.groupByExpr("window(from_unixtime(ride.ts/1000), '1 minute')").count()


query = agg.writeStream.format("console").outputMode("update").start()
query.awaitTermination()