const CENTRAL_TIME_ZONE = "America/Chicago";

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return asUtc - date.getTime();
}

export function centralDateTimeToEpoch(
  publishDate: string,
  publishTime: string
) {
  const [year, month, day] = publishDate.split("-").map(Number);
  const [hour, minute] = publishTime.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    throw new Error("Invalid publication date or time.");
  }

  const initialGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0)
  );

  let offset = getTimeZoneOffsetMs(
    initialGuess,
    CENTRAL_TIME_ZONE
  );

  let result = new Date(initialGuess.getTime() - offset);

  // Recalculate once so DST boundaries are handled correctly.
  offset = getTimeZoneOffsetMs(
    result,
    CENTRAL_TIME_ZONE
  );

  result = new Date(initialGuess.getTime() - offset);

  return Math.floor(result.getTime() / 1000);
}
