package java.util;

public class Date {
    private long timestamp;
    
    public Date(){
        timestamp = System.currentTimeMillis();
    }

    public Date(long date){
        timestamp = date;
    }
    
    public long getTime(){
        return timestamp;
    }

    public boolean after(Date when){
        return timestamp > when.timestamp;
    }

    public boolean before(Date when){
        return timestamp < when.timestamp;
    }

    public boolean equal(Date when){
        return timestamp == when.timestamp;
    }

    public Date clone(){
        return new Date(timestamp);
    }

    public int getDay(){
        return (int) ((timestamp / 86400000) + (long) 4) % 7;
    }
}
