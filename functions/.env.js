
const res = `# keep in secure place, do not commit!!!
DB_HOST="area51.secret-alient-invasion.us-west-2.rds.amazonaws.com"
DB_USERNAME="admin"
DB_PASSWORD="AliensLovePizza123"
DB_PORT="1337"
DB_NAME="area51"
DB_SSL="true"
SSH_HOST="120.34.56.78"
SSH_PASS="password123"
SSH_USER="root"
PENTAGON_SECRET_PASSWORD="PrettyPleaseWithCherriesOnTop"
NUCLEAR_BOMBS_LAUNCH_CODE="1234MakeASandwich"
SECRET_FORMULA="KFC's 11 herbs and spices"
SQUIRREL_INVASION_PREPAREDNESS="Totally unprepared"
PIZZA_SLICE_COUNT="The limit does not exist"
UNICORN_VISIBILITY="Only on days that end in 'Y'"
BEAR_ALERT_LEVEL="Red"  # Because why not?
`

export function onRequest(context) {
  return new Response(res);  
}
