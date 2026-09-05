import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const DEFAULT_TABLE_NAME = 'VivoAmigo_Production_Listings';

export interface ServerlessListing {
  zone_category: string;
  listing_id: string;
  title: string;
  price: number;
  currency: string;
  zone: string;
  category: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DRAFT';
  is_vecino_confiable: number;
  created_at: string;
}

function client(): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' }));
}

export async function queryListingsByZoneCategory(zoneCategory: string, limit = 20): Promise<ServerlessListing[]> {
  if (!zoneCategory.trim()) throw new Error('zoneCategory is required');
  if (limit < 1 || limit > 100) throw new Error('limit must be between 1 and 100');
  const result = await client().send(new QueryCommand({
    TableName: process.env.DYNAMODB_LISTINGS_TABLE || DEFAULT_TABLE_NAME,
    KeyConditionExpression: 'zone_category = :zoneCategory',
    ExpressionAttributeValues: { ':zoneCategory': zoneCategory },
    Limit: limit,
    ScanIndexForward: false
  }));
  return (result.Items || []) as ServerlessListing[];
}

export async function upsertListing(listing: ServerlessListing): Promise<void> {
  await client().send(new PutCommand({ TableName: process.env.DYNAMODB_LISTINGS_TABLE || DEFAULT_TABLE_NAME, Item: listing }));
}

export async function deleteListing(zoneCategory: string, listingId: string): Promise<void> {
  await client().send(new DeleteCommand({
    TableName: process.env.DYNAMODB_LISTINGS_TABLE || DEFAULT_TABLE_NAME,
    Key: { zone_category: zoneCategory, listing_id: listingId }
  }));
}
