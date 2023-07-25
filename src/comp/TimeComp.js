import React from 'react';
import styled from 'styled-components/native';
import dayjs from 'dayjs';
import {durtnText} from '../commons/utils';
import {
  RowCentered,
  GREEN,
  Text10,
  GRAY,
  DGRAY,
  LINEGRAY,
  Text14,
  Text21,
  BACKGRAY,
  BACKGREEN,
  Text16,
} from '../commons/UI';

export const TimeComp = ({big, from, cancel, ...r}) => {
  let passed = r.passed || r.to < Date.now(),
    Time = big ? Text21 : r.med ? Text16 : Text14;
  return (
    <RowCentered {...r}>
      <Time
        style={{
          color: r.color || (r.going ? GREEN : cancel && !big ? GRAY : DGRAY),
        }}
        selectable>
        {dayjs(from)
          .format(big && passed ? 'D MMM YYYY' : 'D MMM')
          .toLowerCase() + ' '}
        <Time style={{color: LINEGRAY}}>|</Time>
        <Time
          style={{
            color:
              r.color ||
              (cancel && !big ? GRAY : !cancel && !passed ? GREEN : DGRAY),
          }}>
          {dayjs(from).format(' HH:mm')}
        </Time>
      </Time>
    </RowCentered>
  );
};

export const DurComp = ({big, cancel, to, ...r}) => {
  let dur = to - r.from,
    passed = r.passed || to < Date.now(),
    Dur = big ? Text14 : Text10;
  return (
    <DurView
      style={[
        {backgroundColor: cancel || passed ? BACKGRAY : BACKGREEN},
        big && {height: 24},
      ]}>
      <Dur
        style={{
          color: cancel && !big ? GRAY : !cancel && !passed ? GREEN : DGRAY,
        }}
        selectable>
        {durtnText(dur / 60000)}
      </Dur>
    </DurView>
  );
};

let DurView = styled.View`
  justify-content: center;
  height: 18px;
  border-radius: 10px;
  padding: 0 11px;
  margin-left: 10px;
`;
