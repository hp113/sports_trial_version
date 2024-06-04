import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server";
import { getSupabase } from "~/supabaseClient";
import { Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import Footer from "~/components/footer";

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
  competitors: { [event_id: number]: Participant[] };
};

export const loader: LoaderFunction = async ({ request }) => {
  const supabase = getSupabase();
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  // Fetch the events the user is participating in
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("*")
    .eq("student_id", user.user_id);

  if (participantsError) {
    console.error("Error fetching participants:", participantsError);
    return json({ error: participantsError.message }, { status: 500 });
  }

  // Fetch competitors for each event
  const competitors: { [event_id: number]: Participant[] } = {};
  for (const participant of participants) {
    const { data: eventCompetitors, error: competitorsError } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", participant.event_id)
      .neq("student_id", user.user_id);

    if (competitorsError) {
      console.error("Error fetching competitors:", competitorsError);
      return json({ error: competitorsError.message }, { status: 500 });
    }

    competitors[participant.event_id] = eventCompetitors;
  }

  return json<LoaderData>({ participants, competitors });
};

export default function DashboardParticipation() {
  const { participants, competitors } = useLoaderData<LoaderData>();

  return (
    <div className="p-4 min-h-screen">
      <h1 className="p-2xl font-bold mb-4">
        This is the list of events in which you participated
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((participant) => (
          <div key={participant.id} className="bg-white shadow rounded-lg p-4">
            <Card >
              <CardHeader>
                <h2 className="font-bold">{participant.event_name}</h2>
              </CardHeader>
              <CardBody>
                <p>
                  <span className="font-bold">Date:</span> {new Date(participant.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p><span className="font-bold">Venue:</span> {participant.event_venue}</p>
                <p className="mt-2 font-semibold"><span className="font-bold">Competitors:</span></p>
                {competitors[participant.event_id]?.length ? (
                  <Table aria-label="Competitors table" >
                    <TableHeader>
                      <TableColumn className="font-bold text-lg">Names</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {competitors[participant.event_id].map((competitor) => (
                        <TableRow key={competitor.id}>
                          <TableCell className="font-bold text-base">{competitor.student_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No competitors found</p>
                )}
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
