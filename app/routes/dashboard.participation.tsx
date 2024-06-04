import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server";
import { getSupabase } from "~/supabaseClient"

type Participant = {
    id: number;
    student_id: string;
    student_name: string;
    event_id: number;
    event_name: string;
    event_date: string;
    event_venue: string;
  };

  type LoaderData = {
    participants: Participant[];
  };

export const loader: LoaderFunction = async({request})=>{
    const supabase = getSupabase();
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get("user");

    const {data: participants, error:participantsError} = await supabase.from('participants').select("*").eq("student_id", user.user_id);
    if(participantsError){
        console.error("ERror fetching participants:", participantsError);
        return json({error:participantsError.message}, {status:500});
    }
return json<LoaderData>({ participants });
}

export default function DashboardParticipation() {
    const { participants } = useLoaderData<LoaderData>();
    return(
        <div>
      <h1>This is the list of events in which you participated</h1>
      <ul>
        {participants.map((participant) => (
          <li key={participant.id}>
            <p>Event Name: {participant.event_name}</p>
            <p>Event Date: {participant.event_date}</p>
            <p>Event Venue: {participant.event_venue}</p>
          </li>
        ))}
      </ul>
    </div>
    )
}