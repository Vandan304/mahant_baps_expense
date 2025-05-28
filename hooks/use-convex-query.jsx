import { useQuery } from "convex/react"
import { useState } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query,...args)=>{
    const result = useQuery(query);
    const [data,setData] = useState(undefined);
    const[isLoading,setIsloading] = useState(true);
    const[error,setError]=useState(null);


    useEffect(() => {
        if (result===undefined) {
            setIsloading(true);
        }
        else{
            try{
                setData(result);
                setError(null);
            } catch (err){
                setError(err);
                toast.error(err.message);
            }
            finally{
                setIsloading(false);
            }
        }
    
    }, [result])
}