const csv = require('@fast-csv/parse');
const parseSymbols = require('./commonTools');

async function parse(input) {
  const data = await readCsv(input, {
    headers: true,
    ignoreEmpty: true,
  });

  return data;
}

function readCsv(path, options) {
  return new Promise((resolve, reject) => {
    const data = [];

    csv
      .parseFile(path, options)
      .on('error', reject)
      .on('data', (row) => {
        row.Highlight = `"${addPaddingToMultilineHighlight(row.Highlight)}"`;
        data.push(row);
      })
      .on('end', () => {
        const books = parseCsv(data);
        resolve(books);
      });
  });
}

function addPaddingToMultilineHighlight(highlight) {
  let highlightLines = highlight.split('\n').filter((l) => l != '');
  const paddedLines = [
    highlightLines[0],
    ...highlightLines.slice(1).map((l) => '    ' + l),
  ];
  return paddedLines.join('\n');
}

function parseCsv(data) {
  let books = [];

  for (const line of data) {
    const book = books.find((b) => b.title == parseSymbols(line['Book Title']));
    if (book) {
      book.quotes.push(createQuoteFromLine(line));
    } else {
      books.push({
        title: parseSymbols(line['Book Title']),
        date: line['Date of Highlight'],
        quotes: [createQuoteFromLine(line)],
      });
    }
  }

  return books;
}

function createQuoteFromLine(line) {
  return {
    chapter: line['Chapter Title'],
    date: line['Date of Highlight'],
    quote: parseSymbols(line.Highlight),
  };
}

module.exports = parse;
