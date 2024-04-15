import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Mark from "mark.js";

function DetailPage() {
    const params = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');

    const [podcastData, setPodcastData] = useState(null);
    const contentRef = useRef(null); // Ref to the content element

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://nasty.local:9200/podcasts/_doc/${params.resourceId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'ApiKey ' + process.env.REACT_APP_ES_API_KEY,
                        'Content-Type': 'application/json',
                        'Sec-Fetch-Site': 'cross-site',
                        'Sec-Fetch-Mode': 'cors'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch the podcast');
                }

                const data = await response.json();
                setPodcastData(data);
            } catch (error) {
                console.error('Error fetching podcast data:', error);
            }
        };

        fetchData();
    }, [params.resourceId]);

    useEffect(() => {
        console.log("Query:", query); // Print params.query

        // Define a list of stop words
        const stopWords = ["the", "of", "and", "to", "in", "a", "for", "on", "with", "at", "by", "from"];

        if (podcastData && query && contentRef.current) {
            const instance = new Mark(contentRef.current);
            instance.unmark(); // Clear previous highlights

            // Mark the whole phrase
            instance.mark(query, {
                separateWordSearch: false,
                className: "highlight-1",
            });

            // Split the query into individual words
            const words = query.split(" ");

            // Mark individual words separately, excluding stop words
            words.forEach(word => {
                if (!stopWords.includes(word.toLowerCase())) {
                    instance.mark(word, {
                        separateWordSearch: true,
                        accuracy: "exactly",
                        className: "highlight-2",
                        exclude: ['mark']
                    });
                }
            });

            // Find the first marked element with class "highlight-2"
            const firstMarkedElement = document.querySelector(".highlight-1");

            // Scroll to the first marked element
            if (firstMarkedElement) {
                firstMarkedElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [podcastData, query]);



    return (
        <div>
            {podcastData ? (
                <div ref={contentRef}>
                    <h2>{podcastData._source.podcast_title}</h2>
                    {podcastData._source.episode_transcript.split('\n\n').map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default DetailPage;
