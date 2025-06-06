import React from "react";

const GroupPage = () => {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("expenses");
  const { data, isLoading } = useConvexQuery(
    api.expenses.getExpenseBetweenUsers,
    { userId: params?.id }
  );
  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }
  const otherUser = data?.otherUser;
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balance = data?.balance || 0;
  return <div></div>;
};

export default GroupPage;
