# goods-for-good
<ol>
<li>Download kafka (https://kafka.apache.org/downloads)</li>
<li>Navigate to the kafka folder</li>
<li>Start All Mongo Docker Containers</li>
<li>Start Zookeeper in the first terminal with the command - 
.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties</li>
<li>Start Broker in the second terminal using the command -
.\bin\windows\kafka-server-start.bat .\config\server.properties</li>
<li>Open the project in VS Code</li>
<li>Download the Dataset - https://drive.google.com/drive/folders/1jxRhq7F2NNqh2W3sLbr22ZwpGLqBCdCD?usp=sharing </li>
<li>Move the folder to the /public</li>

<li>The folder structure should look like: </li>
<img src="./public/images/dataset-folder-structure.png">
<li>Update AWS Keys in: /scripts/backend.py line 30,31 </li>
<li>Update AWS Keys in: /scripts/Data-Upload.ipynb Cell 12  line 6,7</li>
<li>Run backend.py in /scripts</li>
<li>Start Frontend - npm start</li>
<li>Create S3 Buckets: dds-campaign-images, dds-donation-images</li>
<li>Execute Data-Upload.ipynb to insert data and upload images in s3</li>
<li>Create MongoDB Sharded Architecture as: </li>

docker network create mongo-shard-cluster

###############################
docker run -d --net mongo-shard-cluster --name config-svr-1 -p 27101:27017 mongo:4.4 mongod --port 27017 --configsvr --replSet config-svr-replica-set

docker run -d --net mongo-shard-cluster --name config-svr-2 -p 27102:27017 mongo:4.4 mongod --port 27017 --configsvr --replSet config-svr-replica-set

docker run -d --net mongo-shard-cluster --name config-svr-3 -p 27103:27017 mongo:4.4 mongod --port 27017 --configsvr --replSet config-svr-replica-set

#################################

docker exec -it config-svr-1 mongo

rs.initiate({
    _id: "config-svr-replica-set",
    configsvr: true,
    members: [
        { _id: 0, host: "config-svr-1:27017" },
        { _id: 1, host: "config-svr-2:27017" },
        { _id: 2, host: "config-svr-3:27017" }
    ]
})

rs.status()

###############################

docker run -d --net mongo-shard-cluster --name shard-1-node-a -p 27111:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-1-replica-set
docker run -d --net mongo-shard-cluster --name shard-1-node-b -p 27121:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-1-replica-set
docker run -d --net mongo-shard-cluster --name shard-1-node-c -p 27131:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-1-replica-set

docker run -d --net mongo-shard-cluster --name shard-2-node-a -p 27112:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-2-replica-set
docker run -d --net mongo-shard-cluster --name shard-2-node-b -p 27122:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-2-replica-set
docker run -d --net mongo-shard-cluster --name shard-2-node-c -p 27132:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-2-replica-set

docker run -d --net mongo-shard-cluster --name shard-3-node-a -p 27113:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-3-replica-set
docker run -d --net mongo-shard-cluster --name shard-3-node-b -p 27123:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-3-replica-set
docker run -d --net mongo-shard-cluster --name shard-3-node-c -p 27133:27017 mongo:4.4 mongod --port 27017 --shardsvr --replSet shard-3-replica-set

###############################
docker exec -it shard-1-node-a mongo

rs.initiate({
    _id: "shard-1-replica-set",
    members: [
        { _id: 0, host: "shard-1-node-a:27017" },
        { _id: 1, host: "shard-1-node-b:27017" },
        { _id: 2, host: "shard-1-node-c:27017" }
    ]
})
rs.status()


docker exec -it shard-2-node-a mongo

rs.initiate({
    _id: "shard-2-replica-set",
    members: [
        { _id: 0, host: "shard-2-node-a:27017" },
        { _id: 1, host: "shard-2-node-b:27017" },
        { _id: 2, host: "shard-2-node-c:27017" }
    ]
})
rs.status()


docker exec -it shard-3-node-a mongo

rs.initiate({
    _id: "shard-3-replica-set",
    members: [
        { _id: 0, host: "shard-3-node-a:27017" },
        { _id: 1, host: "shard-3-node-b:27017" },
        { _id: 2, host: "shard-3-node-c:27017" }
    ]
})
rs.status()

#############################

docker run -d --net mongo-shard-cluster --name router-1 -p 27141:27017 mongo:4.4 mongos --port 27017 --configdb config-svr-replica-set/config-svr-1:27017,config-svr-2:27017,config-svr-3:27017 --bind_ip_all

docker run -d --net mongo-shard-cluster --name router-2 -p 27142:27017 mongo:4.4 mongos --port 27017 --configdb config-svr-replica-set/config-svr-1:27017,config-svr-2:27017,config-svr-3:27017 --bind_ip_all

#############################

docker exec -it router-1 mongo

sh.addShard("shard-1-replica-set/shard-1-node-a:27017", "shard-1-replica-set/shard-1-node-b:27017", "shard-1-replica-set/shard-1-node-c:27017")

sh.addShard("shard-2-replica-set/shard-2-node-a:27017", "shard-2-replica-set/shard-2-node-b:27017", "shard-2-replica-set/shard-2-node-c:27017")

sh.addShard("shard-3-replica-set/shard-3-node-a:27017", "shard-3-replica-set/shard-3-node-b:27017", "shard-3-replica-set/shard-3-node-c:27017")

sh.status()

################

// Connect to the mongos router
db.adminCommand({ listShards: 1 });

// Shows all shards

sh.status();

sh.enableSharding("donation-system");
db.campaigns.createIndex({ cause: 1 })
db.campaigns.createIndex({ title: "text"});
sh.shardCollection("donation-system.campaigns", { cause: 1 })

sh.splitAt("donation-system.campaigns", { cause: "Flooding and Water-Related" });
sh.splitAt("donation-system.campaigns", { cause: "Heat and Drought" });
sh.splitAt("donation-system.campaigns", { cause: "Wind and Storm" });

sh.moveChunk("donation-system.campaigns", { cause: "Flooding and Water-Related" }, "shard-1-replica-set")
sh.moveChunk("donation-system.campaigns", { cause: "Heat and Drought" }, "shard-2-replica-set")
sh.moveChunk("donation-system.campaigns", { cause: "Wind and Storm" }, "shard-3-replica-set")


If facing error in secondary mongo shell: rs.secondaryOk()

</ol>