import React from 'react';
import ModalLoading from '../src/components/ModalLoading';
import {action} from '@storybook/addon-actions';
import {Wrapper} from './ui';
import {withA11y} from '@storybook/addon-a11y';
import {getLabelName} from "../src/libs/lang";


export default {
  title: getLabelName("Loading Modal"),
  component: ModalLoading,
  decorators: [withA11y],
};

export const Basic = () => (
  <Wrapper>
    <div style={{maxHeight: "200px"}}>
      <ModalLoading
        isOpen={true}
        title= {getLabelName("Loading")}
        message={getLabelName("Loading") +  'something.geojson'}
      />
    </div>
  </Wrapper>
);

