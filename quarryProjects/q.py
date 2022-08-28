import sys
import json
from pyspark.sql import SparkSession

def stepBy(data, step, result):
    if step in result:
        return result
    result.insert(0, step)
    #print(step)
    for i in step["in"]:
        for s in data["steps"]:
            if s["name"] == i:
                stepBy(data, s, result)
    return result

def findTargets(data):
    targets = []
    for step in data["steps"]:
        name = step["name"]
        i = 0
        for s in data["steps"]:
            for si in s["in"]:
                if si == name:
                    i = i + 1
        if i == 0:
            #print("target " + name)
            targets.append(step)
    return targets

def fileSources(data):
    for step in data["steps"]:
        #print("source: " + step["name"])
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
        if step["opt"]["name"] == "JDBCSource":
            url = ""
            dbtabename =""
            props = {}
            for opt in step["opt"]["opts"]:
                if opt["option"] == "url":
                    url = opt["value"]
                if opt["option"] == "dbtabename":
                    dbtabename = opt["value"]
                if opt["option"] != "dbtabename" and opt["option"] != "url":
                    props[opt["option"]] = opt["value"]
            spark.read.jdbc(url, dbtabename, properties=props).createOrReplaceTempView(step["name"])

def arrangeSteps(data):
    arrange = []
    noarrange = []
    for step in data["steps"]:
        if step["opt"]["name"] == "SparkSQL":
            noarrange.append(step)

    j = 0
    while len(noarrange) > 0:
        j = j + 1
        if j > 10000:
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
    return arrange

def writeStep(stepTo):
    if printSchema == True:
        print("schema start " + stepToOrig + " step")
        print(spark.sql("select * from " + stepTo).schema.json()) #printSchema()
        print("schema finish " + stepToOrig)
    else:    
        spark.sql("select * from " + stepTo).show(100)    

def interpolate(t):
    data = json.loads(t)
    for option in data["options"]:
        s1 = ""
        s2 = ""
        for value in option["value"]:
            if value["env"] == env:
                s1 = option["name"]
                s2 = value["value"]
        if s1 == "":
            for value in option["value"]:
                if value["env"] == "":
                    s1 = option["name"]
                    s2 = value["value"]
        if s1 != "":
            t = t.replace("${" + s1 + "}", s2)
            
    return t

sparkApp = ""
stepToOrig = ""
stepTo = None
printSchema = False
env = ""

for arg in sys.argv:
    if "sparkApp=" in arg:
        sparkApp = arg[9:]
    if "stepTo=" in arg:
        stepTo = arg[7:]
        stepToOrig = stepTo
    if "printSchema=true" in arg: 
        printSchema = True
    if "env=" in arg:
        env = arg[4:]

f = open(sparkApp)
t = f.read()
f.close()

data = json.loads(interpolate(t))

for option in data["options"]:
    s1 = ""
    s2 = ""
    for value in option["value"]:
        if value["env"] == env:
            s1 = option["name"]
            s2 = value["value"]
    if s1 == "":
        for value in option["value"]:
            if value["env"] == "":
                s1 = option["name"]
                s2 = value["value"]
    if s1 != "":
        t = t.replace("${" + s1 + "}", s2)

data = json.loads(t)

spark = SparkSession.builder\
        .appName(data["name"])\
        .getOrCreate()

if stepTo != None:
    step = None
    for s in data["steps"]:
        if s["name"] == stepTo:
            step = s
    steps = []
    stepBy(data, step, steps)
    data["steps"] = steps

#print(data["name"])

targets = findTargets(data)

fileSources(data)

arrange = arrangeSteps(data)
           
for step in arrange:
    if step["opt"]["name"] == "SparkSQL":
        sqlFile = ""
        for opt in step["opt"]["opts"]:
            if opt["option"] == "sqlfile":
                sqlFile = opt["value"]
        spark.sql(open(sparkApp[:sparkApp.rfind("/")] + "/scripts/" + sqlFile, "r").read()).createOrReplaceTempView(step["name"])

for target in targets:
    if target["opt"]["name"] == "ParquetTarget":
        if len(target["in"]) != 1:
            raise ValueError("More one in target")
        path = ""
        for opt in target["opt"]["opts"]:
            if opt["option"] == "path":
                path = opt["value"].replace("C:", "file:/mnt/c")
                                    
        if stepTo == None:
            spark.sql("select * from " + target["in"][0]).write.parquet(path)

        if stepTo == target["name"]:
            stepTo = target["in"][0]

if stepTo != None:
    writeStep(stepTo)