import { Html, Head, Preview, Body, Container, Heading, Text, Hr } from "@react-email/components";

export default function BookingCancellation({ recipientName, eventTitle, startTime }) {
  const previewText = `Booking cancelled: ${eventTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Booking cancelled</Heading>
          <Text style={styles.text}>Hi {recipientName},</Text>
          <Text style={styles.text}>
            The booking for <strong>{eventTitle}</strong> on {new Date(startTime).toLocaleString()} has been cancelled.
          </Text>
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



