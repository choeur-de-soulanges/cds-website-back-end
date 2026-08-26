const { getVercelOidcToken } = require("@vercel/oidc");
const { ExternalAccountClient } = require("google-auth-library");
const { Storage } = require("@google-cloud/storage");

const projectId = process.env.GCLOUD_PROJECT_ID;
const projectNumber = process.env.GCLOUD_PROJECT_NUMBER;
const serviceAccountEmail = process.env.GCLOUD_SERVICE_ACCOUNT_EMAIL;
const poolId = process.env.GCLOUD_WORKLOAD_IDENTITY_POOL_ID;
const providerId = process.env.GCLOUD_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

if (!projectId || !projectNumber || !serviceAccountEmail || !poolId || !providerId) {
	throw new Error("Missing Google Cloud WIF configuration");
}

const authClient = ExternalAccountClient.fromJSON({
	type: "external_account",
	audience:
		`//iam.googleapis.com/projects/${projectNumber}` +
		`/locations/global/workloadIdentityPools/${poolId}` +
		`/providers/${providerId}`,
	subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
	token_url: "https://sts.googleapis.com/v1/token",
	service_account_impersonation_url:
		`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
		`${serviceAccountEmail}:generateAccessToken`,
	subject_token_supplier: {
		getSubjectToken: getVercelOidcToken,
	},
});

const storage = new Storage({
	projectId,
	authClient,
});

module.exports = storage;
