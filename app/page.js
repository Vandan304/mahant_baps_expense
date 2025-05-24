import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className=" flex-col flex pt-16">
      <section className="mt-20 pb-12 space-y-10 md:space-y-20 px-5">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Split expenses.Simplify life
          </Badge>
          <h1 className="gradient-title mx-auto max-w-4xl text-4xl font-bold md:text-7xl">
            The smartest way to split expenses with friends
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
            Track shared expenses,split bills effortlessly , and settle up quickly.
            Never worry about who ows who again.
          </p>
        </div>
      </section>
    </div>
  );
}
