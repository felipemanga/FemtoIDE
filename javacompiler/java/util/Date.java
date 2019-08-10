package java.util;

public class Date {
    private long timestamp;

    /// Allocates a `Date` object and initializes it so that it represents the time at which it was allocated, measured to the nearest millisecond.
    public Date(){
        timestamp = System.currentTimeMillis();
    }

    /// Allocates a Date object and initializes it to represent the specified number of milliseconds since the standard base time known as "the epoch", namely January 1, 1970, 00:00:00 GMT.
    public Date(long date){
        timestamp = date;
    }

    /// Returns the number of milliseconds since January 1, 1970, 00:00:00 GMT represented by this Date object.
    public long getTime(){
        return timestamp;
    }

    /// Tests if this date is after the specified date.
    public boolean after(Date when){
        return timestamp > when.timestamp;
    }

    /// Tests if this date is before the specified date.
    public boolean before(Date when){
        return timestamp < when.timestamp;
    }

    /// Compares two dates for equality.
    ///
    /// @note This function is non-standard
    public boolean equal(Date when){
        return timestamp == when.timestamp;
    }

    /// Return a copy of this object.
    ///
    /// @note This function is non-standard
    public Date clone(){
        return new Date(timestamp);
    }

    public int getDay(){
        return (int) ((timestamp / 86400000) + (long) 4) % 7;
    }
}
