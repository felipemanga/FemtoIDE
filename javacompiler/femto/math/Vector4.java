package math;

public class Vector4 {
    float x, y, z;
    
    public Vector4 load( float x, float y, float z ){
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    
    public float lengthSq(){
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }
    
    public float length(){
        return Math.sqrt(this.lengthSq());
    }
    
    public Vector4 sub( float x, float y, float z ){
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }

    public Vector4 mul( Matrix4 mat ){
        float x = this.x, y = this.y, z = this.z;
        /* * /
        this.x = (mat.a0 * x) + (mat.a3 * y) + (mat.a6 * z) + mat.a9;
        this.y = (mat.a1 * x) + (mat.a4 * y) + (mat.a7 * z) + mat.a10;
        this.z = (mat.a2 * x) + (mat.a5 * y) + (mat.a8 * z) + mat.a11;
        /*/
        __inline_cpp__("
        auto& m = *mat;
        this->x = FixedPoints::SFixed<23,8>::fromInternal(
                (m.a0.getInternal() * x.getInternal() >> 8) +
                (m.a3.getInternal() * y.getInternal() >> 8) + 
                (m.a6.getInternal() * z.getInternal() >> 8) + 
                m.a9.getInternal()
        );

        this->y = FixedPoints::SFixed<23,8>::fromInternal(
                (m.a1.getInternal() * x.getInternal() >> 8) +
                (m.a4.getInternal() * y.getInternal() >> 8) + 
                (m.a7.getInternal() * z.getInternal() >> 8) + 
                m.a10.getInternal()
        );

        this->z = FixedPoints::SFixed<23,8>::fromInternal(
                (m.a2.getInternal() * x.getInternal() >> 8) +
                (m.a5.getInternal() * y.getInternal() >> 8) + 
                (m.a8.getInternal() * z.getInternal() >> 8) + 
                m.a11.getInternal()
        );

        ");
        /* */

        return this;
    }
        
    public Vector4 project(float FOV, float width, float height){
        float fovz;
        fovz = FOV / (FOV + z);
        x = (x * fovz) + (width/2);
        y = (height/2) - (y * fovz);
        z = fovz;
        return this;
    }
}
