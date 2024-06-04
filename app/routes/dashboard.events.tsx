import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server";
import { getSupabase } from "~/supabaseClient";
import {
  addParticipant,
  isParticipant,
  removeParticipant,
} from "~/utils/participation.server";

interface Event {
  event_id: number;
  event_name: string;
  event_date: string;
  event_venue: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const supabase = getSupabase();
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  // console.log(user);
  const { data: events, error } = await supabase.from("events").select("*");

  if (error) {
    console.error("Error fetching events:", error);
    return json({ error: error.message }, { status: 400 });
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const event_id = Number(formData.get("event_id"));
  const event_name = formData.get("event_name") as string;
  const event_date = formData.get("event_date") as string;
  const event_venue = formData.get("event_venue") as string;

  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  // console.log(user);

  if (!user) {
    return redirect("/signin");
  }

  if (actionType === "participate") {
    const error = await addParticipant(user.user_id, user.name, {
      event_id,
      event_name,
      event_date,
      event_venue,
    });
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
  } else if (actionType === "remove") {
    const error = await removeParticipant(user.user_id, event_id);
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
  }
  return redirect("/dashboard/events");
};

export default function DashboardEvents() {
  const { events, participants } = useLoaderData<{
    events: Event[];
    participants: any[];
  }>();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Event Details</h2>
      {events.length > 0 ? (
        <Table
          aria-label="Events table"
          // css={{ height: "auto", minWidth: "100%" }}
        >
          <TableHeader>
            <TableColumn className="font-bold text-lg">Name</TableColumn>
            <TableColumn className="font-bold text-lg">Date</TableColumn>
            <TableColumn className="font-bold text-lg">Venue</TableColumn>
            <TableColumn className="font-bold text-lg">Action</TableColumn>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const participating = participants.some(
                (participant) => participant.event_id === event.event_id
              );

              return (
                <TableRow key={event.event_id}>
                  <TableCell className="text-base">{event.event_name}</TableCell>
                  <TableCell className="text-base">
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-base">{event.event_venue}</TableCell>
                  <TableCell >
                    <Form method="post">
                      <input
                        type="hidden"
                        name="event_id"
                        value={event.event_id}
                      />
                      <input
                        type="hidden"
                        name="event_name"
                        value={event.event_name}
                      />
                      <input
                        type="hidden"
                        name="event_date"
                        value={event.event_date}
                      />
                      <input
                        type="hidden"
                        name="event_venue"
                        value={event.event_venue}
                      />
                      <Button
                        type="submit"
                        name="actionType"
                        value={participating ? "remove" : "participate"}
                        className={`font-bold w-[200px] ${
                          participating
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {participating ? "Remove Participation" : "Participate"}
                      </Button>
                    </Form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500">No events available</p>
      )}
      <br />
      <div className="mt-7"></div>
    </div>
  );
}
