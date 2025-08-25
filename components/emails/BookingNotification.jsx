import { Html, Head, Preview, Body, Container, Heading, Text, Hr, Link } from "@react-email/components";

export default function BookingNotification({ hostName, attendeeName, attendeeEmail, eventTitle, startTime, endTime, meetLink }) {
  const previewText = `New booking for ${eventTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>New booking</Heading>
          <Text style={styles.text}>Hi {hostName},</Text>
          <Text style={styles.text}>
            {attendeeName} ({attendeeEmail}) booked <strong>{eventTitle}</strong>.
          </Text>
          <Text style={styles.text}>Starts: {new Date(startTime).toLocaleString()}</Text>
          <Text style={styles.text}>Ends: {new Date(endTime).toLocaleString()}</Text>
          {meetLink ? (
            <Text style={styles.text}>
              Meet link: <Link href={meetLink}>{meetLink}</Link>
            </Text>
          ) : null}
          <Hr style={styles.hr} />
          <Text style={styles.text}>Mischief Meet</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#f6f9fc", fontFamily: "Inter, Arial, sans-serif" },
  container: { backgroundColor: "#ffffff", borderRadius: 8, padding: 24 },
  heading: { margin: "0 0 12px", fontSize: 20 },
  text: { margin: "0 0 12px", color: "#333", lineHeight: 1.5 },
  hr: { borderColor: "#eee", margin: "24px 0" },
};



