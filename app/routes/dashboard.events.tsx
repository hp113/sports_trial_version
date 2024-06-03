import { LoaderFunction, json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server"
import { getSupabase } from "~/supabaseClient";

interface Event {
    event_id: number;
    event_name: string;
    event_date: string;
    event_venue: string;
  }

export const loader: LoaderFunction = async ({request})=>{
    const supabase = getSupabase();
    const {data: events, error} = await supabase.from('events').select('*');

    if(error){
        return json({error: error.message}, {status: 400});
    }

    return json({events});
};


export default function DashboardEvents() {
    const {events} = useLoaderData<{events: Event[]}>();

    return(
        <div>
            <h2>Events :</h2>
            {
                events.length>0?(
                    events.map(event =>(
                        <div key = {event.event_id}>
                            <h3>{event.event_name}</h3>
                            <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                            <p>Venue: {event.event_venue}</p>
                        </div>
                    ))
                ):(<p>No events available</p>)
            }
        </div>
    )
}