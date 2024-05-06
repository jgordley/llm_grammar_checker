import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Tooltip, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import { styled } from '@mui/material/styles';

const Highlight = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  cursor: 'pointer',
}));

const modelsDict = {
  'OpenAI': ['gpt-3.5-turbo', 'gpt-4'],
  'Telnyx': ['meta-llama/Meta-Llama-3-8B-Instruct', 'meta-llama/Meta-Llama-3-70B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.2', 'NousResearch/Nous-Hermes-2-Mistral-7B-DPO', 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'],
  'TogetherAI': ['mistralai/Mistral-7B-Instruct-v0.1', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'togethercomputer/CodeLlama-34b-Instruct'],
};

export default function Home() {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Provider and Model selection
  const [provider, setProvider] = React.useState('OpenAI');
  const [availableModels, setAvailableModels] = React.useState(['gpt-3.5-turbo', 'gpt-4']);
  const [model, setModel] = React.useState('gpt-3.5-turbo');
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
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      console.log(data.grammar_suggestions)
      setSuggestions(data.grammar_suggestions);

    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const annotatedText = () => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const suggestion = suggestions.find(s => s.word_index === index);
      return suggestion ? (
        <Tooltip key={index} title={`${suggestion.word_correction}: ${suggestion.explanation}`} placement="top">
          <span> </span><Highlight>{word}</Highlight>
        </Tooltip>
      ) : ' ' + word;
    });
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
        {text && annotatedText()}
      </Box>
    </Container>
  );
}
