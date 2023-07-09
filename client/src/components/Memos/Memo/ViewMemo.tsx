import { useContext } from 'react';
import { Card, Text, Row, Tooltip, Button, Spacer } from '@nextui-org/react';
import IMemo from '../../../interfaces/Memo';
import { MemoContext } from '.';

const ViewMemo = ({ title, content, dateCreated, user, id }: IMemo) => {
  const { handleEdit, handleDelete } = useContext(MemoContext);
  const { username } = user;

  return (
    <Card variant='bordered' isPressable isHoverable>
      <Card.Header>
        <Row justify='center'>
          <Text h4>{title}</Text>
        </Row>
      </Card.Header>
      <Card.Divider />
      <Card.Body>
        <Text>{content}</Text>
        <Spacer y={0.5} />
        <Button size='sm' color='gradient' shadow onPressStart={handleEdit}>
          edit
        </Button>
      </Card.Body>
      <Card.Divider />
      <Card.Footer>
        <Text>
          created on: {dateCreated} by <b>{username}</b>
        </Text>
        <Tooltip content='delete this memo' contentColor='warning'>
          <Button onPressStart={handleDelete} size='xs' shadow color='error'>
            <Text>delete</Text>
          </Button>
        </Tooltip>
      </Card.Footer>
    </Card>
  );
};
export default ViewMemo;
