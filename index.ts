import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const image = awsx.ecr.buildAndPushImage("sampleapp", {
    context: "./app",
});

const role = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});

new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
});

new aws.iam.RolePolicyAttachment("S3FullAccess", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicies.AmazonS3FullAccess,
});


const bucket = new aws.s3.Bucket("test-adam-napso");

const func = new aws.lambda.Function("helloworld", {
    memorySize: 2048,
    packageType: "Image",
    imageUri: image.imageValue,
    role: role.arn,
    timeout: 60,
    environment: {
        variables: {
            S3_BUCKET: bucket.bucket
        }
    }
});