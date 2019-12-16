# csv-normalizer
Command line tool written in NodeJS used to take in CSV data and output a normalized CSV file

## Usage:

Install node dependencies

```
npm install
```

Run the following command passing in your input and output file paths

```
node normalize.js < input.csv > < output.csv >
```

## Notes:
- As noted in the exercise, with the time allotted I was unable to fully implement all of the normalization specifications. With more time I would have loved to tackle the Duration columns, better error handling, and removing library dependencies.
- For all validation approaches I tried to the best of my ablity to avoid using modern ES6 functionality and external library dependencies. I ultimately chose to use the MomentJS library to deal with handling timezone data due to the tricky nature of handling that information using the native JS Date object. I went with MomentJS specifically because the library is heaviliy tested, well supported, and maintained.
