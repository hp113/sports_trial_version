import { getSupabase } from "~/supabaseClient";

export async function addParticipant(student_id:string, student_name:string, event:any){
    const supabase = getSupabase();
    const {error} = await supabase.from('participants').insert([
        {
            student_id,
            student_name,
            event_id: event.event_id,
            event_name: event.event_name,
            event_date: event.event_date,
            event_venue: event.event_venue
        },
    ]);
    return error;
}


export async function removeParticipant(student_id: string, event_id: number){
    const supabase = getSupabase();
    const {error} = await supabase.from('participants').delete().eq("student_id", student_id).eq("event_id", event_id);
    return error;
}

export async function isParticipant(student_id:string, event_id:number){
    const supabase = getSupabase();
    const {data, error} = await supabase.from("participants").select("*").eq("student_id", student_id).eq("event_id", event_id);
    if(error){
        return false;
    }
    return data.length > 0;
}