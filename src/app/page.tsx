import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { HomeClient } from "@/components/custom/home-client";
import { RestaurantList } from "@/components/custom/restaurant-list";

export const GET_COUNTRIES_AND_ROLES = gql`
  query GetCountriesAndRoles {
    distinctCountries
    distinctRoles
  }
`;

export default async function Home() {
  const { data } = await client.query({ query: GET_COUNTRIES_AND_ROLES }) as any;
  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-background gap-16 max-w-7xl mx-auto w-full">
      <div className="w-full flex flex-col items-center gap-8 py-12">
        <h1 className="text-4xl font-black tracking-tight mb-4">Food Ordering System</h1>
        <HomeClient
          distinctCountries={data.distinctCountries}
          distinctRoles={data.distinctRoles}
        />
      </div>
    </div>
  );
}
