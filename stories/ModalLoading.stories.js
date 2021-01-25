import React from 'react';
import ModalLoading from '../src/components/ModalLoading';
import {action} from '@storybook/addon-actions';
import {Wrapper} from './ui';
import {withA11y} from '@storybook/addon-a11y';


export default {
  title: '加载窗口',
  component: ModalLoading,
  decorators: [withA11y],
};

export const Basic = () => (
  <Wrapper>
    <div style={{maxHeight: "200px"}}>
      <ModalLoading
        isOpen={true}
        title="正在加载"
        message="正在加载 'something.geojson'"
      />
    </div>
  </Wrapper>
);

