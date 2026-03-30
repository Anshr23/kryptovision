import DataTable from "@/components/DataTable"
import Image from "next/image"

const page = () => {
  return (
    <main className="main-container">
      <section className="home-grid">
        <div className="coin-overview">
          <div className="header pt-2">
            <Image src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" 
            width={56} height={56} alt="Bitcoin's Logo" />

            <div className="info">
              <p>Bitcoin / BTC</p>
              <h1>$81,534.55</h1>
            </div>
          </div>
        </div>

        <p>Trending Coins</p>
        <DataTable />
      </section>

      <section className="w-full mt-7 space-y-4">
        <p>Categories</p>
      </section>
    </main>
  )
}

export default page