import React, {useEffect, useState} from 'react';
import './App.css';
import {MenuItem,FormControl,Select,Card,CardContent,} from "@material-ui/core";
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import { sortData, prettyPrintStat } from './utils';
import Graph from './components/Graph';
import 'leaflet/dist/leaflet.css';

function App() {

	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState('worldwide');
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);
	const [mapCenter, setMapCenter] = 
		useState({lat: 20.5937, lng: 78.9629});
	const [mapZoom, setMapZoom] = useState(3);
	const [mapCountries, setMapCountries] = useState([]);
	const [casesType, setCasesType] = useState('cases');

	useEffect(() => {
		const getCountriesData = async() => {
			fetch("https://disease.sh/v3/covid-19/countries")
			.then((res) => res.json())
			.then((data) => {
				const countries = data.map((country) => (
					{
						name: country.country,
						value: country.countryInfo.iso2,
					}
				));
				const sortedData = sortData(data);
				setTableData(sortedData);
				setMapCountries(data);
				setCountries(countries);
			})
		}

		getCountriesData();
	}, []);

	const onCountryChange = async(e) => {
		const countryCode = e.target.value;
		setCountry(countryCode);

		const url = 
			countryCode === 'worldwide' 
				? 'https://disease.sh/v3/covid-19/all'
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;
		
		await fetch(url)
			.then(res => res.json())
			.then (data => {
				setCountry(countryCode);
				setCountryInfo(data);
				setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
				setMapZoom(4);
			});
	};

	useEffect(() => {
		fetch('https://disease.sh/v3/covid-19/all')
			.then(res => res.json())
			.then((data) => setCountryInfo(data));
	},[]);


  return (
    <div className="app">
    	<div className="app-left">
	    	{/*========Header========= */}
	    	<div className="app-header">
		    	<h1>COVID-19 Tracker</h1>
		    	<FormControl className="dropdown">
		    		<Select
		    			varient="outline"
		    			value={country}
		    			onChange={onCountryChange}
		    		>
		    			<MenuItem value="worldwide">Worldwide</MenuItem>
		    			{countries?.map((country) => (
		    				<MenuItem value={country.value}>{country.name}</MenuItem>
							))}
		    		</Select>
		      </FormControl>
		    </div>
		    {/*========Header-Ends========= */}

		   	{/*========Info-Boxes========= */}
		    <div className="app-stats">
		    	<InfoBox 
		    		isRed
		    		active={casesType === "cases"}
		    		onClick={e => setCasesType('cases')}
		    		title="Coronavirus Cases" 
		    		cases={prettyPrintStat(countryInfo.todayCases)} 
		    		total={countryInfo.cases}
		    	/>

		    	<InfoBox
		    		active={casesType === "recovered"}
		    		onClick={e => setCasesType('recovered')} 
		    		title="Recovered" 
		    		cases={prettyPrintStat(countryInfo.todayRecovered)} 
		    		total={countryInfo.recovered} 
		    	/>

		    	<InfoBox
		    		isRed 
		    		active={casesType === "deaths"}
		    		onClick={e => setCasesType('deaths')}
		    		title="Death" 
		    		cases={prettyPrintStat(countryInfo.todayDeaths)} 
		    		total={countryInfo.deaths} 
		    	/>
		    </div>
		    {/*========Info-Boxes-Ends========= */}

		    {/*========MAP========= */} 
		    <div className="map">
		    	<Map 
		    		casesType={casesType}
		    		center={mapCenter} 
		    		zoom={mapZoom}
		    		countries={mapCountries} 
		    	/>
		    </div>
		    {/*========MAP-END========= */}  
		  </div>
		  <Card className="app-right">
		  	<CardContent>

		  		{/*========TABLE========= */}
		  		<h3>Live Cases by Country</h3>
		  		<Table countries={tableData} />
		  		{/*========TABLE-END========= */}

		  		{/*========Graph========= */}
		  		<h3>Worldwide New {casesType}</h3>
		  		<Graph casesType={casesType} />

		  	</CardContent>
		  </Card>
    </div>
  );
}

export default App;
