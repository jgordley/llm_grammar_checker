import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Tooltip, InputLabel, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { styled } from '@mui/material/styles';

const WordHighlight = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  cursor: 'pointer',
}));

const GrammarHighlight = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  cursor: 'pointer',
}));

const modelsDict = {
  'OpenAI': ['gpt-3.5-turbo-0125', 'gpt-4-turbo-preview'],
  'Telnyx': ['meta-llama/Meta-Llama-3-8B-Instruct', 'meta-llama/Meta-Llama-3-70B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.2', 'NousResearch/Nous-Hermes-2-Mistral-7B-DPO', 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'],
  'TogetherAI': ['mistralai/Mistral-7B-Instruct-v0.1', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'togethercomputer/CodeLlama-34b-Instruct'],
};

export default function Home() {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [grammar, setGrammar] = useState([]);
  const [suggestionType, setSuggestionType] = React.useState('spelling');

  // Provider and Model selection
  const [provider, setProvider] = React.useState('OpenAI');
  const [availableModels, setAvailableModels] = React.useState(modelsDict['OpenAI']);
  const [model, setModel] = React.useState(modelsDict['OpenAI'][0]);
  const [key, setKey] = React.useState('');

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleProviderChange = (event) => {
    setProvider(event.target.value);
    setAvailableModels(modelsDict[event.target.value]);
  }

  const handleModelChange = (event) => {
    setModel(event.target.value);
  }

  const handleKeyChange = (event) => {
    setKey(event.target.value);
  }

  const handleSuggestionTypeChange = (event) => {
    setSuggestionType(event.target.value);
  }

  const providerDropdown = () => {
    return (
      <>
        <FormControl sx={{ m: 1, ml: 0, minWidth: 120 }} size="small">
          <InputLabel id="provider-select-label">Provider</InputLabel>
          <Select
            labelId="provider-select-label"
            id="provider-select"
            value={provider}
            label="Provider"
            onChange={handleProviderChange}
          >
            <MenuItem value={'OpenAI'}>OpenAI</MenuItem>
            <MenuItem value={'Telnyx'}>Telnyx</MenuItem>
            <MenuItem value={'TogetherAI'}>TogetherAI</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
          <InputLabel id="model-select-label">Model</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={model}
            label="Model"
            onChange={handleModelChange}
          >
            {availableModels.map((model, index) => (
              <MenuItem key={index} value={model}>{model}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <TextField
            fullWidth
            size="small"
            label="API Key"
            value={key}
            type="password"
            onChange={handleKeyChange}
            variant="outlined"
          />
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={suggestionType}
            onChange={handleSuggestionTypeChange}
          >
            <FormControlLabel value="spelling" control={<Radio />} label="Spelling" />
            <FormControlLabel value="grammar" control={<Radio />} label="Grammar" />
          </RadioGroup>
        </FormControl>
      </>
    );
  }

  const checkText = async () => {

    if (key === '') {
      alert('Please enter your API key');
      return;
    }

    try {
      const response = await fetch('/api/grammar_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, provider, model, key, suggestionType }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      console.log(data.spelling_suggestions)
      setSuggestions(data.spelling_suggestions);
      setGrammar(data.grammar_suggestions);

    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const spellingAnnotatedText = () => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const suggestion = suggestions.find(s => s.word_index === index);
      return suggestion ? (
        <Tooltip key={index} title={`${suggestion.word_correction}: ${suggestion.explanation}`} placement="top">
          <span> </span><WordHighlight>{word}</WordHighlight>
        </Tooltip>
      ) : (index == 0 ? word : ' ' + word);
    });
  };

  const grammarAnnotatedText = () => {
    const words = text.split(' ');

    // Sort the grammar suggestions by indexes given first_word_index and last_word_index
    grammar.sort((a, b) => a.first_word_index - b.first_word_index);

    if (grammar.length === 0) {
      return text;
    }

    let annotatedText = [];
    let wordIndex = 0;

    grammar.forEach((suggestion) => {
      // Add the text before the suggestion
      annotatedText.push(words.slice(wordIndex, suggestion.first_word_index).join(' '));
      // Add the suggestion
      annotatedText.push(
        <Tooltip key={suggestion.first_word_index} title={`${suggestion.improved_sentence} (${suggestion.explanation})`} placement="top">
          <span> </span><GrammarHighlight>{words.slice(suggestion.first_word_index, suggestion.last_word_index + 1).join(' ')}</GrammarHighlight>
        </Tooltip>
      );
      wordIndex = suggestion.last_word_index + 1;
    });

    // Add remaining text after the last suggestion
    annotatedText.push(words.slice(wordIndex).join(' '));
    return annotatedText;
  };


  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom style={{ marginTop: '25px' }}>
        📝 LLM Grammar Spell Checker
      </Typography>
      {providerDropdown()}
      <TextField
        fullWidth
        label="Enter your text"
        multiline
        rows={10}
        value={text}
        onChange={handleTextChange}
        variant="outlined"
        margin="normal"
      />
      <Button onClick={checkText} variant="contained" color="primary" style={{ marginTop: 20 }}>
        Check Text
      </Button>
      <Box component="div" sx={{ whiteSpace: 'pre-wrap', marginTop: 2 }}>
        {text && (suggestionType == "spelling" ? spellingAnnotatedText() : grammarAnnotatedText())}
      </Box>
    </Container>
  );
}
