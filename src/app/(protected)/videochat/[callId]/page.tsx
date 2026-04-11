'use client';
import { useEffect, useState } from "react";
import {
  Call,
  CallControls,
  StreamCall,
  StreamTheme,
  StreamVideo,
  SpeakerLayout,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
// @ts-ignore
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useFirebase } from "@/firebase/firebase.config";
import { useParams } from "next/navigation";

export default function VideoChat() {
  const {callId} = useParams();
  if(!callId){
    throw new Error("Call ID is required");
  }
  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const {loggedInUser} = useFirebase();
  

  // const callId = "csb-" + "randon-call-id";
  const callType = "default";

  // Ensure user_id is only set when loggedInUser is available
  const user_id = loggedInUser?.uid || "";
  const user = { id: user_id, name: loggedInUser?.displayName || "random-name" };

  const apiKey = "mmhfdzb5evj2";
  const tokenProvider = async () => {
    const { token } = await fetch(
      "https://pronto.getstream.io/api/auth/create-token?" +
      new URLSearchParams({
        api_key: apiKey,
        user_id: user_id,
      })
    ).then((res) => res.json());
    return token as string;
  };

  useEffect(() => {
    if (!loggedInUser) return; // Ensure loggedInUser is available before initializing the client
    console.log(loggedInUser.uid)

    const myClient = new StreamVideoClient({ apiKey, user, tokenProvider });
    setClient(myClient);

    return () => {
      myClient.disconnectUser();
      setClient(undefined);
    };
  }, [loggedInUser]); // Add loggedInUser as a dependency

  useEffect(() => {
    if (!client) return;

    const myCall = client.call(callType, callId as string);
    myCall.join({ create: true }).catch((err) => {
      console.error(`Failed to join the call`, err);
    });

    setCall(myCall);

    return () => {
      setCall(undefined);
      myCall.leave().catch((err) => {
        console.error(`Failed to leave the call`, err);
      });
    };
  }, [client]);

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamTheme className="my-theme-overrides">
        <StreamCall call={call}>
          <SpeakerLayout />
          <CallControls />
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
