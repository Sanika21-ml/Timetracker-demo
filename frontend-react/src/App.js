import { useMsal } from "@azure/msal-react";
import axios from "axios";

function App(){

 const { instance, accounts } = useMsal();

 const login = () => {
   instance.loginPopup();
 }

 const submit = async () => {

   const token = await instance.acquireTokenSilent({
     scopes:["api://BACKEND_APP_ID/.default"],
     account: accounts[0]
   });

   await axios.post("https://YOUR_BACKEND_URL/api/time",{
     userId:"test",
     projectId:"proj1",
     workstreamId:"ws1",
     hoursWorked:8
   },{
     headers:{ Authorization:`Bearer ${token.accessToken}` }
   });

 }

 return (
   <div>
     <h2>Time Tracker</h2>
     <button onClick={login}>Login</button>
     <button onClick={submit}>Add Entry</button>
   </div>
 );
}

export default App;
