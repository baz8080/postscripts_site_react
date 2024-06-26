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
import { Link } from 'react-router-dom';
import "@elastic/react-search-ui-views/lib/styles/styles.css";


const connector = new ElasticsearchAPIConnector({
  host: process.env.REACT_APP_ES_HOST,
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
      episode_summary: {},
      episode_transcript: {}
    },
    result_fields: {
      _id: {
        raw: {}
      },
      podcast_title: {
        raw: {}
      },
      episode_title: {
        raw: {}
      },
      podcast_image: {
        raw: {}
      },
      episode_image: {
        raw: {}
      },
      episode_published_on: {
        raw: {}
      },
      episode_transcript: {
        snippet: { size: 400, fallback: true }
      },
      episode_audio_link: {
        raw: {}
      }
    },
    disjunctiveFacets: ["podcast_title.keyword", "episode_published_on", "podcast_collections.keyword, all_tags.keyword"],
    facets: {
      "podcast_title.keyword": { type: "value" },
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
      },
      "podcast_collections.keyword": { type: "value" },
      "all_tags.keyword": { type: "value" },
    }
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false
};


const CustomResultView = ({
  result,
  rst,
}) => (
  <li className="sui-result">
    <div className="sui-result__header">
      <div className="sui-result__title">
        <span>{result.podcast_title.raw}</span>{" - "}
        <span>
          <Link
            to={{
              pathname: `/detail/${result.id.raw}`,
              search: `?query=${encodeURIComponent(rst.resultSearchTerm)}`,
            }}
          >{result.episode_title.raw}</Link>
        </span>
      </div>
      
    </div>

    <div className="sui-result__body">  
      <div className="sui-result__image">
        <img src={result.episode_image.raw || result.podcast_image.raw} alt="" />
      </div>
      
      <div
        className="sui-result__details"
      >
        <p>
          <span className="sui-result__key">Released on</span>{" "}
          <span className="sui-result__value">{result.episode_published_on.raw}</span>
        </p>
        <p>
          <span className="sui-result__key">Transcript</span>{" "}
          <span className="sui-result__value" dangerouslySetInnerHTML={{ __html: result.episode_transcript.snippet }}></span>
        </p>
        <br/>    
      </div>
    </div>
  </li>
);

const withCustomProps = (Component, customProps) => {
  // Return a new component that wraps the original component and passes custom props
  return (props) => <Component {...props} {...customProps} />;
};

function App() {

  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched, resultSearchTerm }) => ({ wasSearched, resultSearchTerm })}>

        {({ wasSearched, resultSearchTerm }) => {

          const customProps = { rst: { resultSearchTerm } };
          const CustomResultViewWithProps = withCustomProps(CustomResultView, customProps);

          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={
                    <SearchBox />
                  }
                  sideContent={
                    <div>
                      {wasSearched && <Sorting label={"Sort by"} sortOptions={[]} />}
                      <Facet key={"1"} field={"podcast_collections.keyword"} label={"Collection"} />
                      <Facet key={"2"} field={"podcast_title.keyword"} label={"Pod Title"} />
                      <Facet key={"3"} field={"all_tags.keyword"} label={"Tags"} />
                      <Facet key={"4"} field={"episode_duration"} label={"Duration"} />
                      <Facet key={"5"} field={"episode_published_on"} label={"Published"} />
                      
                    </div>
                  }
                  bodyContent={<Results shouldTrackClickThrough={true} resultView={CustomResultViewWithProps} />}
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
