import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server"
import { getSupabase } from "~/supabaseClient";
import { addParticipant, isParticipant, removeParticipant } from "~/utils/participation.server";

interface Event {
    event_id: number;
    event_name: string;
    event_date: string;
    event_venue: string;
  }

export const loader: LoaderFunction = async ({request})=>{
    const supabase = getSupabase();
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get("user");
    console.log(user);
    const {data: events, error} = await supabase.from('events').select('*');

    if(error){
        console.error("Error fetching events:", error);
        return json({error: error.message}, {status: 400});
    }

    // Fetch participant data for the user
  const { data: participants, error: participantsError } = await supabase
  .from("participants")
  .select("*")
  .eq("student_id", user.user_id);

if (participantsError) {
  console.error("Error fetching participants:", participantsError);
  return json({ error: participantsError.message }, { status: 500 });
}

return json({ events, participants, user });
};



export const action: ActionFunction = async ({request}) => {
    const formData = await request.formData();
    const actionType = formData.get("actionType") ;
    const event_id = Number(formData.get("event_id"));
    const event_name = formData.get("event_name") as string;
    const event_date = formData.get("event_date") as string;
    const event_venue = formData.get("event_venue") as string;

    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get("user");
    // console.log(user);

    if(!user){
        return redirect("/signin");
    }

    if(actionType === "participate"){
        const error = await addParticipant(user.user_id, user.name, {event_id, event_name, event_date, event_venue});
        if(error){
            return json({error: error.message}, {status: 400});
        }
    }else if(actionType === "remove"){
        const error = await removeParticipant(user.user_id, event_id);
        if(error){
            return json({error:error.message}, {status:400});
        }
    }
    return redirect("/dashboard/events");
};

export default function DashboardEvents() {
    const {events,participants} = useLoaderData<{events: Event[], participants: any[]}>();

    return(
        <div>
        <h2>Event Details</h2>
        {events.length > 0 ? (
          events.map(event => {
            const participating = participants.some(participant => participant.event_id === event.event_id);
  
            return (
              <div key={event.event_id}>
                <h3>{event.event_name}</h3>
                <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                <p>Venue: {event.event_venue}</p>
                <Form method="post">
                  <input type="hidden" name="event_id" value={event.event_id} />
                  <input type="hidden" name="event_name" value={event.event_name} />
                  <input type="hidden" name="event_date" value={event.event_date} />
                  <input type="hidden" name="event_venue" value={event.event_venue} />
                  <button type="submit" name="actionType" value={participating ? "remove" : "participate"}>
                    {participating ? "Remove Participation" : "Participate"}
                  </button>
                </Form>
              </div>
            );
          })
        ) : (
          <p>No events available</p>
        )}
      </div>
    )
}