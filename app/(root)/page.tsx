"use client";

import { useRouter } from "next/navigation";
import HeaderBox from "@/components/HeaderBox";
import RecentTransactions from "@/components/RecentTransactions";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { useEffect, useState } from "react";

// Updated User type
type User = {
  $id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  email: string;
  name: string;
  dwollaCustomerUrl: string;
  dwollaCustomerId: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;

  password: string;
  // Add other fields as needed based on your app structure
};

const Home = ({ searchParams: { id, page } }: SearchParamProps) => {
  const router = useRouter();
  const currentPage = Number(page as string) || 1;

  const [loggedIn, setLoggedIn] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getLoggedInUser();
        if (!user) {
          router.push("/sign-in");
        } else {
          setLoggedIn(user);
          const accounts = await getAccounts({ userId: user.$id });
          setAccounts(accounts);

          if (accounts?.data?.length) {
            const appwriteItemId = id || accounts.data[0]?.appwriteItemId;
            const account = await getAccount({ appwriteItemId });
            setAccount(account);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, router]);

  if (!loggedIn || !accounts || !account) {
    return <div>Loading...</div>;
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox
            accounts={accounts.data}
            totalBanks={accounts.totalBanks}
            totalCurrentBalance={accounts.totalCurrentBalance}
          />
        </header>
        <RecentTransactions
          accounts={accounts.data}
          transactions={account.transactions}
          appwriteItemId={id}
          page={currentPage}
        />
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={account.transactions}
        banks={accounts.data.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
