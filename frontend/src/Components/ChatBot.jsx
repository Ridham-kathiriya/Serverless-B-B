import LexChat from "react-lex-plus";
import useAuthHook from "../Hooks/useAuth"

const ChatBot = () => {
    const IDENTITY_POOL_ID = process.env.REACT_APP_LEX_IDENTITY_POOL_ID;
    const {userAttributes} = useAuthHook()
    return (
        <LexChat
            botName="ServerlessBnB"
            IdentityPoolId={IDENTITY_POOL_ID}
            placeholder="Enter..."
            backgroundColor="#FFFFFF"
            height="300px"
            region="us-east-1"
            headerText="ServerlessB&B Bot"
            headerStyle={{ backgroundColor: "#024082", fontSize: "20px" }}
            sessionAttributes={{"userID": userAttributes.email, "username": userAttributes.firstName}}
            greeting="Hello, Welcome to ServerlessBnB! How can I help?"
        />
    )
}

export default ChatBot;