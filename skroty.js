var AWS = require("aws-sdk");
var helpers = require("./helpers");
AWS.config.loadFromPath('./config.json');
var fs = require('fs');

var task =  function(request, callback){
		var s3 = new AWS.S3();
		var sqs = new AWS.SQS();  
		var queueUrl = "https://sqs.us-west-2.amazonaws.com/983680736795/WozniakSQS";
		var algorithms = ['sha1', 'md5', 'sha256', 'sha512']
		sqs.receiveMessage({QueueUrl: queueUrl},
		function (err,data){
		
			  while (data.Messages[0]) {
				 var messagenfo = JSON.parse(data.Messages[0].Body);
						var parms={
						Bucket:messagenfo.bucket, 
						Key: messagenfo.key
						};
			s3.getObject(parms,function(err,file){
			if (err){console.log(err, err.stack);}
			else{
				var message=file.Body;
				helpers.calculateMultiDigest(message, algorithms, 
				function(err, digests) {	
					console.log(digests);	
				       fs.writeFile("/home/bitnami/awslab4/actions/skroty.s", digests, 
					function(err){if(err)return console.log(err);
					console.log("Saved");
					});
					var params = {
		 				 QueueUrl: queueUrl,
		 				 ReceiptHandle:  data.Messages[0].ReceiptHandle
							};
						sqs.deleteMessage(params, function(err, data) {
		 				 if (err) console.log(err, err.stack); // an error occurred
						}); 
				}, 1);
				}			
			});
		//	}else{
		//		console.log("nie ma nic w kolejce");
			}
		});
}		
task();
