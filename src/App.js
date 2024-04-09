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
  host: "https://localhost:9200",
  apiKey: process.env.REACT_APP_ES_API_KEY,
  index: "podcasts"
});

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
    disjunctiveFacets: ["podcast_title.keyword", "podcast_type.keyword", "episode_type.keyword"],
    facets: {
      "podcast_title.keyword": { type: "value" },
      "podcast_type.keyword": { type: "value" },
      "episode_type.keyword": { type: "value" },
      // released: {
      //   type: "range",
      //   ranges: [
      //     {
      //       from: "2012-04-07T14:40:04.821Z",
      //       name: "Within the last 10 years"
      //     },
      //     {
      //       from: "1962-04-07T14:40:04.821Z",
      //       to: "2012-04-07T14:40:04.821Z",
      //       name: "10 - 50 years ago"
      //     },
      //     {
      //       to: "1962-04-07T14:40:04.821Z",
      //       name: "More than 50 years ago"
      //     }
      //   ]
      // },
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
