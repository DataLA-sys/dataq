import json
from pyspark.sql import SparkSession

apppath = "/mnt/c/projects/sbtprojects/dataq/quarryProjects/Example1/scripts/"

spark = SparkSession.builder\
        .master("local[*]")\
        .appName('PySpark_Tutorial')\
        .getOrCreate()

f = open("/mnt/c/projects/sbtprojects/dataq/quarryProjects/Example1/Example1.json")
data = json.load(f)
print(data["name"])
targets = []
for step in data["steps"]:
    name = step["name"]
    i = 0
    for s in data["steps"]:
        for si in s["in"]:
            if si == name:
                i = i + 1
    if i == 0:
        print("target " + name)
        targets.append(step)

for step in data["steps"]:
    print("source: " + step["name"])
    if step["opt"]["name"] == "CsvSource":
        delimiter = ","
        path = ""
        header = "false"
        for opt in step["opt"]["opts"]:
            if opt["option"] == "delimeter":
                delimiter = opt["value"]
            if opt["option"] == "path":
                path = opt["value"].replace("C:", "file:/mnt/c")
            if opt["option"] == "fistRowAsColumnNames":
                header = opt["value"]
        spark.read.option("delimiter", delimiter).option("header", header).csv(path).createOrReplaceTempView(step["name"])

arrange = []
noarrange = []
for step in data["steps"]:
    if step["opt"]["name"] == "SparkSQL":
        noarrange.append(step)

jj = 0
while len(noarrange) > 0:
    jj = jj + 1
    if jj > 10000:
        raise ValueError("Circle!")
    for step in noarrange:
        i = 0
        for inn in step["in"]:
            for step2 in noarrange:
                if step2["name"] != step["name"] and inn == step2["name"]:
                    i = i + 1
        if i == 0:
            arrange.append(step)
            noarrange.remove(step)

for a in arrange:
    print(a["name"])
            
for step in arrange:
    if step["opt"]["name"] == "SparkSQL":
        sqlFile = ""
        for opt in step["opt"]["opts"]:
            if opt["option"] == "sqlfile":
                sqlFile = opt["value"]
        spark.sql(open(apppath + sqlFile, "r").read()).createOrReplaceTempView(step["name"])

for target in targets:
    if len(target["in"]) != 1:
        raise ValueError
    path = ""
    for opt in target["opt"]["opts"]:
        if opt["option"] == "path":
            path = opt["value"].replace("C:", "file:/mnt/c")
    spark.sql("select * from " + target["in"][0]).write.save(path)
f.close()