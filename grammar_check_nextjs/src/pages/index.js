import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const Highlight = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  cursor: 'pointer',
}));

export default function Home() {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const checkText = async () => {
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
      <Typography variant="h3" component="h1" gutterBottom style={{marginTop: '25px'}}>
       📝 LLM Grammar Spell Checker
      </Typography>
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
