import { AuthType } from "../../AuthType";
import { DefaultAccountExperienceType } from "../../DefaultAccountExperienceType";
import { deleteSqlContainer } from "../../Utils/arm/generatedClients/2020-04-01/sqlResources";
import { deleteCassandraTable } from "../../Utils/arm/generatedClients/2020-04-01/cassandraResources";
import { deleteMongoDBCollection } from "../../Utils/arm/generatedClients/2020-04-01/mongoDBResources";
import { deleteGremlinGraph } from "../../Utils/arm/generatedClients/2020-04-01/gremlinResources";
import { deleteTable } from "../../Utils/arm/generatedClients/2020-04-01/tableResources";
import { logConsoleError, logConsoleInfo, logConsoleProgress } from "../../Utils/NotificationConsoleUtils";
import { logError } from "../Logger";
import { sendNotificationForError } from "./sendNotificationForError";
import { userContext } from "../../UserContext";
import { client } from "../CosmosClient";
import { refreshCachedResources } from "../DataAccessUtilityBase";

export async function deleteCollection(databaseId: string, collectionId: string): Promise<void> {
  const clearMessage = logConsoleProgress(`Deleting container ${collectionId}`);
  try {
    if (window.authType === AuthType.AAD && !userContext.useSDKOperations) {
      await deleteCollectionWithARM(databaseId, collectionId);
    } else {
      await client()
        .database(databaseId)
        .container(collectionId)
        .delete();
    }
  } catch (error) {
    logConsoleError(`Error while deleting container ${collectionId}:\n ${JSON.stringify(error)}`);
    logError(JSON.stringify(error), "DeleteCollection", error.code);
    sendNotificationForError(error);
    throw error;
  }
  logConsoleInfo(`Successfully deleted container ${collectionId}`);
  clearMessage();
  await refreshCachedResources();
}

function deleteCollectionWithARM(databaseId: string, collectionId: string): Promise<void> {
  const subscriptionId = userContext.subscriptionId;
  const resourceGroup = userContext.resourceGroup;
  const accountName = userContext.databaseAccount.name;
  const defaultExperience = userContext.defaultExperience;

  switch (defaultExperience) {
    case DefaultAccountExperienceType.DocumentDB:
      return deleteSqlContainer(subscriptionId, resourceGroup, accountName, databaseId, collectionId);
    case DefaultAccountExperienceType.MongoDB:
      return deleteMongoDBCollection(subscriptionId, resourceGroup, accountName, databaseId, collectionId);
    case DefaultAccountExperienceType.Cassandra:
      return deleteCassandraTable(subscriptionId, resourceGroup, accountName, databaseId, collectionId);
    case DefaultAccountExperienceType.Graph:
      return deleteGremlinGraph(subscriptionId, resourceGroup, accountName, databaseId, collectionId);
    case DefaultAccountExperienceType.Table:
      return deleteTable(subscriptionId, resourceGroup, accountName, collectionId);
    default:
      throw new Error(`Unsupported default experience type: ${defaultExperience}`);
  }
}
