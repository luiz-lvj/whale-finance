import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { get, push, ref } from "firebase/database";
import FormInvestor from '../../components/FormInvestor/FormInvestor';
import LineChartComponent from '../../components/LineChartComponent/LineChartComponent';
import PieChartComponent from '../../components/PieChartComponent/PieChartComponent';
import { useParams } from 'react-router-dom';
import DataDiv from '../../components/DataDiv/DataDiv';
import Footer from '../../components/Footer/Footer';
import { ethers } from 'ethers';
import { WhaleFinanceAddress, ZusdAddress } from '../../utils/addresses';
import { QuotaTokenAbi } from '../../contracts/QuotaToken';
import { WhaleFinanceAbi } from '../../contracts/WhaleFinance';

type DataPoint = {
    date: string;
    fundId: number;
    performanceValue: number;
    bmId: number;
    benchmarkValue: number; 
};

export default function FundId({ isMetamaskInstalled, connectWallet, account, provider, signer }: 
    { isMetamaskInstalled: boolean; connectWallet: any; account: string | null; provider: any; signer: any;}) {

    const { id } = useParams<{ id: string }>();

    const history = useNavigate();

    const [invest, setInvest] = React.useState(0);

    const [fund, setFund] = useState(null);

    const [data, setData] = useState<DataPoint[]>([]);

    const [zusdBalance, setZusdBalance] = useState(0);
    const [quotaBalance, setQuotaBalance] = useState(0);
    const [quotaPrice, setQuotaPrice] = useState(1);
    const [totalQuotas, setTotalQuotas] = useState(0);

    function handleSubmit() {

        const body = {
            "value_invested": invest
        }

    }


    async function getZusdBalance() {
        try{

            const zusdContract = new ethers.Contract(ZusdAddress, QuotaTokenAbi, signer);

            const balance = await zusdContract.functions.balanceOf(account);
            setZusdBalance(parseFloat(ethers.utils.formatEther(balance[0])));

        } catch(err){
            console.log(err);
        }
    }

    async function getQuotaBalance(){
        try{
            const whaleFinanceContract = new ethers.Contract(WhaleFinanceAddress, WhaleFinanceAbi, signer);


            const quotaAddressses = await whaleFinanceContract.functions.quotasAddresses(id);
            console.log("quota", quotaAddressses);

            const quotaContract = new ethers.Contract(quotaAddressses[0], QuotaTokenAbi, signer);

            const balance = await quotaContract.functions.balanceOf(account);

            setQuotaBalance(parseFloat(ethers.utils.formatEther(balance[0])));

        }catch(err){
            console.log(err);
        }
    }

    async function makeInvestment(){
        try{
            if(invest <= 0 || invest > zusdBalance){
                alert("Please enter a valid amount to invest");
                return;
            }

            const whaleFinanceContract = new ethers.Contract(WhaleFinanceAddress, WhaleFinanceAbi, signer);

            const zusdContract = new ethers.Contract(ZusdAddress, QuotaTokenAbi, signer);

            const txApprove = await zusdContract.functions.approve(WhaleFinanceAddress, ethers.utils.parseEther(String(invest)));

            console.log(txApprove);

            await txApprove.wait();

            const txInvest = await whaleFinanceContract.functions.invest(ethers.utils.parseEther(String(invest)), id);

            await txInvest.wait();

            console.log(txInvest);
            history("/successinvestment");

        }catch(err){
            console.log(err);
        }
    }

    useEffect(() =>{
        getZusdBalance();

    },[signer]);

    useEffect(() => {

        getQuotaBalance();
    }, [signer]);

    useEffect(() => {

        const fetchData = async () => {
          try {            
            // Fetching data from the Performance database
            const performanceRef = ref(db, 'Performance');
            const performanceSnapshot = await get(performanceRef);
            const performanceData = performanceSnapshot.exists() ? performanceSnapshot.val() : [];

            // Fetching data from the Benchmark database
            const benchmarkRef = ref(db, 'BenchmarkValue');
            const benchmarkSnapshot = await get(benchmarkRef);
            const benchmarkData = benchmarkSnapshot.exists() ? benchmarkSnapshot.val() : [];

            // Fetching data from the Performance database
            const fundsRef = ref(db, 'Funds');
            const fundsSnapshot = await get(fundsRef);
            const fundsData = fundsSnapshot.exists() ? fundsSnapshot.val() : [];

            const matchedFund = fundsData.find(fund => fund.id === parseInt(id));
            if (matchedFund) {
                setFund(matchedFund);
            } else {
                console.log("Fund not found");
            }
                
            const combinedData:any[] = [];

            performanceData.forEach((pItem) => {
                benchmarkData.forEach((bItem) => {
                if (pItem.date === bItem.date && pItem.fundId === parseInt(id)) {
                    combinedData.push({
                    date: pItem.date,
                    fundId: pItem.fundId,
                    performanceValue: pItem.value,
                    bmId: bItem.bmId,
                    benchmarkValue: bItem.value,
                    });
                }
                });
            });


            setData( [...combinedData] );

            } catch (error) {
            console.error("Error reading data:", error);
            }
        };

        // fetchData();

        function mockData(){
            const fundx = {
                id: 1,
                name: "Bridgewater Associates",
                description: "Macro"
            };

            setFund(fundx);
            
            setData([...[
                { date: "09-09", fundId: 1, performanceValue: 95, bmId: 300001, benchmarkValue: 90 },
                { date: "09-10", fundId: 1, performanceValue: 98, bmId: 300001, benchmarkValue: 91 },
                { date: "09-11", fundId: 1, performanceValue: 97, bmId: 300001, benchmarkValue: 92 },
                { date: "09-12", fundId: 1, performanceValue: 99, bmId: 300001, benchmarkValue: 93 },
                { date: "09-13", fundId: 1, performanceValue: 100, bmId: 300001, benchmarkValue: 94 },
                { date: "09-14", fundId: 1, performanceValue: 97, bmId: 300001, benchmarkValue: 95 },
                { date: "09-15", fundId: 1, performanceValue: 101, bmId: 300001, benchmarkValue: 95 },
                { date: "09-16", fundId: 1, performanceValue: 104, bmId: 300001, benchmarkValue: 96 },
            ]])
        }
        mockData();
    }, []);

    if (!fund) {
        return (
        <div className='w-[100vw] h-screen text-gray-700 bg-[#f6f6f6] overflow-y-auto'>
                <section className="">
                    <div className="container mx-auto px-6 text-center py-8 opacity-60">
                        <h2 className="flex justify-center items-center bg-white h-[12vh] text-4xl font-bold text-center text-secondary-color rounded-[20px]">
                        </h2>
                        <div className='flex flex-row justify-center h-[70vh] my-10 mx-6 mb-12 shadow-lg bg-white text-secondary-color rounded-[20px]'>
                        </div>
                        <div className='flex flex-row justify-center h-[70vh] my-12 mb-24'>
                            <div className='basis-1/2 mx-6 px-10 h-[70vh] shadow-lg bg-white text-secondary-color rounded-[20px]'>
                            </div>
                            <div className='basis-1/2 mx-6 px-10 h-[70vh] shadow-lg bg-white text-secondary-color rounded-[20px]'>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div> 
        )
    }

    return (
        <>
            <div className='w-[100vw] h-screen text-gray-700 bg-[#f6f6f6] overflow-y-auto'>
                <section className="">
                    <div className="container mx-auto px-0 text-center py-8 md:px-6 lg:px-6">
                        <h2 className="flex justify-center items-center bg-white h-[12vh] mx-6 text-4xl font-bold text-center text-secondary-color shadow-lg rounded-[20px]">
                        {fund.name}
                        </h2>
                        <div className='flex flex-col md:flex-row lg:flex-row justify-center md:h-[70vh] lg:h-[70vh] my-10 mx-6 mb-12 shadow-lg bg-white text-secondary-color rounded-[20px]'>
                            <div className='flex-1 md:basis-2/3 lg:basis-2/3 md:mx-2 md:px-10 lg:mx-2 lg:px-10'>
                                <h1 className='font-bold text-2xl mt-6 mb-1 md:text-left md:ml-12 lg:text-left lg:ml-12'>Performance</h1>
                                <div className='flex justify-center sm:block sm:justify-start lg:block lg:justify-start'>
                                    <div className='h-[2px] w-36 mb-8 md:ml-12 lg:ml-12 bg-secondary-color'></div>
                                </div>
                                <div className='w-[90%] md:w-[100%] lg:w-[100%] h-[80%] flex items-center justify-center'>
                                    <LineChartComponent data={data} />
                                </div>
                            </div>
                            <div className='flex-1 md:basis-1/3 lg:basis-1/3 mx-2 px-10 '>
                                <h1 className='font-bold text-2xl mt-6 mb-1 md:text-left lg:text-left'>Invest</h1>


                                <div className='flex justify-center sm:block sm:justify-start lg:block lg:justify-start'>
                                    <div className='h-[2px] w-16 md:mb-8 lg:mb-8 bg-secondary-color'></div>
                                </div>

                                {/* put some data here */}

                                <div className='flex justify-center sm:block sm:justify-start lg:block lg:justify-start'>
                                        <h3>Your ZUSD Balance: {Number(zusdBalance).toFixed(2)}</h3>
                                        <h3>Your quotas Balance: {Number(quotaBalance).toFixed(2)}</h3>
                                        <h3>Quota Price: {Number(quotaPrice).toFixed(2)} USD/quota</h3>
                                        <h3>Total number of quotas: {Number(totalQuotas).toFixed(2)}</h3>

                                </div>


                                <FormInvestor   
                                    invest={invest}
                                    setInvest={setInvest}
                                />
                                <button
                                className="my-4 bg-gradient-to-r from-blue-color to-secondary-color text-white font-bold rounded-full border-2 border-transparent py-2 px-20 shadow-lg uppercase tracking-wider hover:from-white hover:to-white hover:text-secondary-color hover:border-secondary-color transition duration-1000 ease-in-out" onClick={makeInvestment}
                                >
                                Invest
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col md:flex-row lg:flex-row justify-center md:h-[70vh] lg:h-[70vh] my-12 mb-24'>
                            <div className='md:basis-1/2 lg:basis-1/2 mx-6 md:px-10 lg:px-10 h-[70vh] shadow-lg bg-white text-secondary-color rounded-[20px]'>
                                <h1 className='font-bold text-2xl mt-6 mb-1 mx-10 md:mx-0 lg:mx-0 text-left'>Tokens</h1>
                                <div className='h-[2px] w-20 mb-8 mx-10 md:mx-0 lg:mx-0 bg-secondary-color'></div>
                                <div className='w-[100%] h-[80%] flex items-center justify-center'>
                                    <PieChartComponent />
                                </div>
                            </div>
                            <div className='mt-12 md:mt-0 lg:mt-0 md:basis-1/2 lg:basis-1/2 mx-6 px-10 h-[70vh] shadow-lg bg-white text-secondary-color rounded-[20px]'>
                                <h1 className='font-bold text-2xl mt-6 mb-1 text-left'>Data</h1>
                                <div className='h-[2px] w-14 mb-8 bg-secondary-color'></div>
                                <DataDiv fund={fund}/>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        </>
    )
}