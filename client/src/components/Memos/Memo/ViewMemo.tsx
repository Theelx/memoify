import { useContext } from 'react';
import { Card, Text, Row, Tooltip, Button, Spacer } from '@nextui-org/react';
import IMemo from '../../../interfaces/Memo';
import { MemoContext } from '.';
import dateFormatter from '../../../utils/dateFormatter';

const ViewMemo = ({ title, content, dateCreated, author, id }: IMemo) => {
  const { handleEdit, handleDelete } = useContext(MemoContext);
  const { username } = author;
  const { formattedDate, formattedTime } = dateFormatter(dateCreated);

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
        <Tooltip
          content='edit memo owo'
          contentColor='secondary'
          color='default'
          css={{}}
        >
          <Button
            size='sm'
            color='gradient'
            shadow
            onPressStart={handleEdit}
            // css={{ width: '100%' }}
          >
            edit
          </Button>
        </Tooltip>
      </Card.Body>
      <Card.Divider />
      <Card.Footer>
        <Row justify='space-between'>
          <Text>
            created on {formattedDate} at {formattedTime} by <b>{username}</b>
          </Text>
          <Tooltip
            content='delete memo ÒwÓ'
            contentColor='warning'
            color='default'
            css={{}}
          >
            <Button onPressStart={handleDelete} size='xs' shadow color='error'>
              <Text>delete</Text>
            </Button>
          </Tooltip>
        </Row>
      </Card.Footer>
    </Card>
  );
};
export default ViewMemo;
