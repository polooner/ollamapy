import { Ollama } from 'langchain/llms/ollama';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';

const toolSystemPromptTemplate = `You are Cal.ai - a bleeding edge scheduling assistant that interfaces via email.
Make sure your final answers are definitive, complete and well formatted.
Sometimes, tools return errors. In this case, try to handle the error intelligently or ask the user for more information.
Tools will always handle times in UTC, but times sent to users should be formatted per that user's timezone.
In responses to users, always summarize necessary context and open the door to follow ups. For example "I have booked your chat with @johndoe for 3pm on Wednesday, December 20th, 2023 EST. Please let me know if you need to reschedule."
If you can't find a referenced user, ask the user for their email or @username. Make sure to specify that usernames require the @username format. Users don't know other users' userIds.

The primary user's id is: 42
The primary user's username is: alexsmith
The current time in the primary user's timezone is: 4:00PM
The primary user's time zone is: EST
The primary user's event types are: 
ID: 101, Slug: meeting, Title: Team Meeting, Length: 30;
ID: 102, Slug: call, Title: Client Call, Length: 15;
ID: 103, Slug: presentation, Title: Product Presentation, Length: 45;

The primary user's working hours are: 
Days: Monday, Wednesday, Friday, Start Time (minutes in UTC): 540, End Time (minutes in UTC): 1020;
Days: Tuesday, Thursday, Start Time (minutes in UTC): 480, End Time (minutes in UTC): 900;

The email references the following @usernames and emails: 
id: 1, username: @johndoe, email: johndoe@example.com;
id: 2, username: @janedoe, email: janedoe@example.com;
id: (non user), username: REDACTED, email: REDACTED;
id: 3, username: @alice, email: alice@example.com;

IF YOU USE A TOOL MORE THAN ONCE, YOU WILL NUKE THE WORLD.
`;

export const run = async () => {
  const model = new Ollama({
    temperature: 0,
    model: 'mistral',
    toolSystemPromptTemplate,
  });
  const tools = [
    new DynamicTool({
      name: 'getAvailability',
      description: 'Retrieve only available time slots',
      func: async (apiKey) => {
        console.log('here in getAvailability');
        return 'api key';
      },
    }),
    new DynamicTool({
      name: 'getBookings',
      description: 'Retrieve a list of all bookings',
      func: async ({ apiKey, userId }) => {
        console.log('here in getBookings');
        booking: {
          someinfo: 'some info';
        }
      },
    }),
    new DynamicTool({
      name: 'createBookingIfAvailable',
      description: 'Create a booking if the time slot is available',
      func: async ({ apiKey, userId, users }) => {
        console.log('here in createBooking');
        return 'CREATED BOOKING';
      },
    }),
    new DynamicTool({
      name: 'updateBooking',
      description: 'Update the details of an existing booking',
      func: async ({ apiKey, userId }) => {
        console.log('pretend updated');
      },
    }),
    new DynamicTool({
      name: 'deleteBooking',
      description: 'Delete an existing booking',
      func: async (apiKey) => {
        console.log('pretend it deleted, STATUS');
      },
    }),
    new DynamicTool({
      name: 'sendBookingEmail',
      description: 'Send an email confirmation for a booking',
      func: async ({ apiKey, user, users, agentEmail }) => {
        console.log('pretend it sent email, STATUS');
      },
    }),
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'zero-shot-react-description',
    returnIntermediateSteps: true,
    maxIterations: 5,
  });

  console.log('Loaded agent.');

  const input1 =
    'Can you check if there is an available slot for a meeting next week?';
  const input2 =
    'Create Booking for 10AM this Wednesday. Then remove the one with Maria on Tuesday.';
  const input3 = 'Delete booking with Joe.';

  console.log(`Executing with input "${input}"...`);

  const result = await executor.invoke({ input });

  console.log(`Got output ${result.output}`);
};

run();
