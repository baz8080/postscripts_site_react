import './App.css';

import React from "react";

import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

const connector = new ElasticsearchAPIConnector({
  host: "https://nasty.local:9200",
  apiKey: process.env.REACT_APP_ES_API_KEY,
  index: "podcasts"
});



const todayMs = Date.now();
const todayDate = new Date(todayMs)

let oneYearAgo = new Date(todayMs)
oneYearAgo.setUTCFullYear(todayDate.getUTCFullYear() - 1)

let threeYearsAgo = new Date(todayMs)
threeYearsAgo.setUTCFullYear(todayDate.getUTCFullYear() - 3)

let fiveYearsAgo = new Date(todayMs)
fiveYearsAgo.setUTCFullYear(todayDate.getUTCFullYear() - 5)

let tenYearsAgo = new Date(todayMs)
tenYearsAgo.setUTCFullYear(todayDate.getUTCFullYear() - 10)


const config = {

  searchQuery: {
    search_fields: {
      episode_title: {},
      episode_transcript: {}
    },
    result_fields: {
      podcast_title: {
        raw: {}
      },
      episode_title: {
        raw: {}
      },
      episode_transcript: {
        snippet: {size: 3200, fallback:true}
      }
    },
    disjunctiveFacets: ["podcast_title.keyword", "podcast_type.keyword", "episode_type.keyword", "episode_published_on"],
    facets: {
      "podcast_title.keyword": { type: "value" },
      "podcast_type.keyword": { type: "value" },
      "episode_type.keyword": { type: "value" },
      episode_published_on: {
        type: "range",
        ranges: [
          {
            from: oneYearAgo.toISOString(),
            name: "Within the last 1 year"
          },
          {
            from: threeYearsAgo.toISOString(),
            to: oneYearAgo.toISOString(),
            name: "1 - 3 years ago"
          },
          {
            from: fiveYearsAgo.toISOString(),
            to: threeYearsAgo.toISOString(),
            name: "3 - 5 years ago"
          },
          {
            from: tenYearsAgo.toISOString(),
            to: fiveYearsAgo.toISOString(),
            name: "5 - 10 years ago"
          },
          {
            to: tenYearsAgo.toISOString(),
            name: "More than 10 years ago"
          }
        ]
      },
      episode_duration: {
        type: "range",
        ranges: [
          { from: 1, to: 1800, name: "Short" },
          { from: 1801, to: 3600, name: "Medium" },
          { from: 3601, to: 5400, name: "Long" },
          { from: 5401, name: "Very long" }
        ]
      }
    }
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false
};

function App() {

  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={
                    <SearchBox/>
                  }
                  sideContent={
                    <div>
                      {wasSearched && <Sorting label={"Sort by"} sortOptions={[]} />}
                      <Facet key={"1"} field={"podcast_title.keyword"} label={"ptitle"} />
                      <Facet key={"2"} field={"podcast_type.keyword"} label={"pttpe"} />
                      <Facet key={"3"} field={"episode_type.keyword"} label={"etype"} />
                      <Facet key={"4"} field={"episode_duration"} label={"duration"} />
                      <Facet key={"5"} field={"episode_published_on"} label={"published"} />
                    </div>
                  }
                  bodyContent={<Results shouldTrackClickThrough={true} />}
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}

export default App;
