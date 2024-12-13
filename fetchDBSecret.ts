import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { readFileSync, writeFileSync } from 'fs';

interface DBCredentials {
  username: string;
  password: string;
  dbname: string;
  host: string;
  port: number;
}

const secret_name = "fitizen-staging-db-credentials";

const client = new SecretsManagerClient({
  region: "us-east-1",
});

async function getDBCredentials(secretId : string): Promise<DBCredentials> {
  try {
    const data = await client.send(
      new GetSecretValueCommand({
        SecretId: secretId,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
    if (!data.SecretString) {
      throw new Error('Secret string is empty');
    }
    return JSON.parse(data.SecretString);
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
}

async function updateEnv(): Promise<void> {
  try {
    // Read existing .env content
    let envContent = '';
    try {
      envContent = readFileSync('.env', 'utf8');
    } catch (error) {
      console.log('No existing .env file found, creating new one');
    }

    const credentials = await getDBCredentials(secret_name);
    const dbUrl = `postgresql://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.dbname}`;
    // Remove existing DATABASE_URL if it exists
    const envLines = envContent.split('\n').filter(line => !line.startsWith('DATABASE_URL='));
        
    // Add new DATABASE_URL
    envLines.push(`DATABASE_URL="${dbUrl}"`);
    
    // Write back to file
    writeFileSync('.env', envLines.join('\n') + '\n');
    console.log('Successfully updated .env file');

  } catch (error) {
    console.error('Error updating .env:', error);
    process.exit(1);
  }
}

updateEnv();