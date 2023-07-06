import { useState } from 'react';
import {
  Container,
  Input,
  Textarea,
  Button,
  FormElement,
  Spacer
} from '@nextui-org/react';
import { createMemo } from '../../services/memos';
import Memo from '../../interfaces/Memo';

const CreateMemo = ({
  memos,
  setMemos,
  token
}: {
  memos: Memo[];
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  token: string;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleInputChange = (e: React.ChangeEvent<FormElement>) => {
    const inputElement = e.currentTarget.id;
    const inputValue = e.currentTarget.value;
    if (inputElement === 'InputTitle') setTitle(inputValue);
    else if (inputElement === 'TextareaContent') setContent(inputValue);
  };
  //ADD TEMPORARY MESSAGE COMPONENT TO NOTIFY THE USER WHEN THEY HAVE SUCCESSFULLY CREATED A NEW MEMO, LATER
  const handleCreate = async () => {
    try {
      const createdMemo = await createMemo(
        {
          title,
          content,
          dateCreated: Date.now()
        },
        token
      );
      setTitle('');
      setContent('');
      setMemos([...memos, createdMemo]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container direction='column'>
      <Input
        id='InputTitle'
        labelPlaceholder='title'
        onChange={handleInputChange}
        value={title}
        clearable
        bordered
        color='secondary'
      />
      <Spacer y={0.5} />
      <Textarea
        id='TextareaContent'
        label="what's on your mind?"
        placeholder='content'
        onChange={handleInputChange}
        value={content}
        minRows={5}
        maxRows={10}
        bordered
        color='secondary'
      />
      <Spacer />
      <Button color='gradient' bordered onPressStart={handleCreate} shadow>
        create memo
      </Button>
    </Container>
  );
};

export default CreateMemo;