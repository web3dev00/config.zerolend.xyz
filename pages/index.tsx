import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';
import dataService from '../services/data'
import {
  ChainId
} from '@aave/contract-helpers';
import { marketConfig } from '../utils/marketconfig';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';



const Home: NextPage = () => {

  interface Asset {
    symbol: string,
    baseLTVasCollateral: string,
    reserveLiquidationThreshold: string,
    liqBonus: string,
    collRatio: string,
    reserveFactor: string,
    varBorrowRate: string,
    stableBorrowRate: string,
    avgStableBorrowRate: string,
    optimalUsageRatio: string,
    canBorrow: string,
    stableBorrowingEnabled: string
}



const markets = {
  v2 : [
    {
      name: 'ethereum',
      config: marketConfig.ethereum
    },
    {
      name: 'eth amm',
      config: marketConfig.ethamm
    },
    {
      name: 'avalanche',
      config: marketConfig.avalanche
    },
    {
      name: 'polygon',
      config: marketConfig.polygon
    }
  ],
  v3 : [
    {
      name: 'arbitrum',
      config: marketConfig.arbitrum
    },
    {
      name: 'avalanche',
      config: marketConfig.avalanchev3
    },
    {
      name: 'fantom',
      config: marketConfig.fantom
    },
    {
      name: 'harmony',
      config: marketConfig.harmony
    },
    {
      name: 'optimism',
      config: marketConfig.optimism
    },
    {
      name: 'polygon',
      config: marketConfig.polygonv3
    }
  ]
}

  enum selectedprotocol {
   v2 = 'v2',
   v3 = 'v3'
  }


  const [riskParamsEthereum, setRiskParamsEthereum] = useState<Asset[] | undefined>([]);
  const [ market, setMarket ] = useState<any []>()
  const [ selectedMarket, setSelectedMarket ] = useState<string>('')
  const [ protocol, setProtocol ] = useState<string >('')
  const [ protocolSelected, setProtocolSelected ] = useState<boolean >(false)

  
  const handleProtocolChange = (event: SelectChangeEvent) => {
    setProtocol(event.target.value)
    setProtocolSelected(true)

    if(event.target.value === 'v2')setMarket(markets.v2)
    if(event.target.value === 'v3')setMarket(markets.v3)
  }

  const handleMarketChange = (event: SelectChangeEvent) => {
    console.log(event.target.value)
    const mkt = market?.find(n => n.name === event.target.value)
    dataService.fetchReservesAny(mkt.config).then(data => setRiskParamsEthereum(data))

  }

 
  return (
    
    <div className={styles.container}>
      <Head>
        <title>config.fyi</title>
      </Head>
        <h3>
          config.fyi
        </h3>
        <Box sx={{ display: 'flex' , margin: 'auto' , width: 500, p: 5, justifyContent: 'flex-start' }}>
         
         <FormControl fullWidth size="small">
           <InputLabel id="demo-simple-select-label">Protocol</InputLabel>
           <Select sx={{ width: 200 }} value={protocol} onChange={handleProtocolChange}>
             <MenuItem value='v2'>aave v2</MenuItem>
             <MenuItem value='v3'>aave v3</MenuItem>
           </Select>
         </FormControl>

         <FormControl fullWidth size="small">
           <InputLabel id="demo-simple-select-label">Market</InputLabel>
             <Select  sx={{ width: 200 }} value={selectedMarket} disabled={!protocolSelected} onChange={handleMarketChange}>
               {market?.map((n) => (
                 <MenuItem key={n.name} value={n.name}>{n.name}</MenuItem>
               ))}
             </Select>
         </FormControl>
       
       </Box>
          <TableContainer  >
              <Table sx={{ width: 1300, margin: 'auto' , border: '1px dashed grey'  }} size="small" aria-label="a dense table " >
                <TableHead>
                  <TableRow>
                    <TableCell><b>asset</b></TableCell>
                    <TableCell align="right"><b>LTV</b></TableCell>
                    <TableCell align="right"><b>liquidation thereshold</b></TableCell>
                    <TableCell align="right"><b>liquidation bonus</b></TableCell>
                    <TableCell align="right"><b>reserve factor</b></TableCell>
                    <TableCell align="right"><b>can borrow?</b></TableCell>
                    <TableCell align="right"><b>optimal utilization</b></TableCell>
                    <TableCell align="right"><b>collateralization ratio</b></TableCell>
                    <TableCell align="right"><b>variable borrow rate</b></TableCell>
                    <TableCell align="right"><b>can borrow stable?</b></TableCell>
                    <TableCell align="right"><b>stable borrow rate</b></TableCell>
                    <TableCell align="right"><b>avg market rate for stable borrow</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskParamsEthereum?.map((n) => (
                    <TableRow
                      key={n.symbol}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">{n.symbol}
                      </TableCell>
                      <TableCell align="right">{n.baseLTVasCollateral}</TableCell>
                      <TableCell align="right">{n.reserveLiquidationThreshold}</TableCell>
                      <TableCell align="right">{n.liqBonus}</TableCell>
                      <TableCell align="right">{n.reserveFactor}</TableCell>
                      <TableCell align="right">{n.canBorrow}</TableCell>
                      <TableCell align="right">{n.optimalUsageRatio}</TableCell>
                      <TableCell align="right">{n.collRatio}</TableCell>
                      <TableCell align="right">{n.varBorrowRate}</TableCell>
                      <TableCell align="right">{n.stableBorrowingEnabled}</TableCell>
                      <TableCell align="right">{n.stableBorrowRate}</TableCell>
                      <TableCell align="right">{n.avgStableBorrowRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
    </div>
  )
}

export default Home
