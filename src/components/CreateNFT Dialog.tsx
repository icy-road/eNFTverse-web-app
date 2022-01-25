import React, { useCallback, useState } from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import UploadSingleFile, { CustomFile } from './UploadSingleFile';
import { generateIPFSMetadataHash } from '../api/ApiClient';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import Web3 from 'web3';

type Props = {
  openCreateNftDialog: boolean;
  setOpenCreateNftDialog: Function;
  metamaskAddress: string
};

const TAGS_OPTION = ['Art'];

const nftContractABI = require('../utils/NFTContract.json');

export default function CreateNFTDialog({ openCreateNftDialog, setOpenCreateNftDialog, metamaskAddress }: Props) {
  const web3 = new Web3('https://cronos-testnet-3.crypto.org:8545');

  const nftContractAddress = '0x94667a5A3042f3369033F9476bFf9A0E51f361d7';

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const { library, chainId } = useWeb3React<Web3Provider>();

  const NewProductSchema = Yup.object().shape({
    nftName: Yup.string().required('Name is required'),
    nftDescription: Yup.string().required('Description is required'),
    author: Yup.string().required('Author is required'),
    tags: Yup.array().min(1, 'Tags are required'),
    image: Yup.object().shape({
      preview: Yup.string().required('Image is required'),
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nftName: '',
      nftDescription: '',
      author: '',
      tags: [TAGS_OPTION[0]],
      image: {} as CustomFile,
    },
    validationSchema: NewProductSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      if (library) {
        generateIPFSMetadataHash(values).then(async ({ data }) => {
          console.log('got', data);
          console.log('metamaskAddress', metamaskAddress);
          const sender = metamaskAddress;

          const mintToEncodedAbi = await nftContract.methods
            .mint(data.ipfsMetadataHash)
            .encodeABI();

          // const mintToEncodedAbi = await nftContract.mintToEncodedAbi(
          //   data.ipfsMetadataHash
          // );

          const nonce = await library.getTransactionCount(sender);
          const transactionData = {
            from: sender,
            to: nftContractAddress,
            data: mintToEncodedAbi,
            gasPrice: await library.getGasPrice(),
            nonce,
          };
          const gasPrice = await library.estimateGas(transactionData);
          // @ts-ignore
          library.sendTransaction(transactionData).on('transactionHash', async (txHash) => {
            console.log('txHash:');
            console.log(txHash);
            window.open(`{{config.web3.explorer}}/tx/${txHash}/`);
          });
        });
      }

      try {
        resetForm();
        setSubmitting(false);
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error.message);
      }
    },
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } =
    formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      setFieldValue(
        'image',
        Object.assign(
          {},
          {
            preview: URL.createObjectURL(file),
            path: file.path,
            size: file.size,
          }
        )
      );
    },
    [setFieldValue]
  );

  return (
    <Dialog
      fullWidth={true}
      fullScreen={fullScreen}
      open={openCreateNftDialog}
      onClose={() => {
        setOpenCreateNftDialog(false);
      }}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        <Typography variant="h5">{'Create NFT'}</Typography>
      </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Stack
              spacing={3}
              sx={{
                pt: 3,
              }}
            >
              <UploadSingleFile
                maxSize={3145728}
                accept={'image/*'}
                file={values.image}
                onDrop={handleDrop}
                error={Boolean(touched.image && errors.image)}
              />
              <TextField
                color="secondary"
                label="Name*"
                {...getFieldProps('nftName')}
                error={Boolean(touched.nftName && errors.nftName)}
              />
              <TextField
                color="secondary"
                multiline
                maxRows={4}
                label="Description*"
                {...getFieldProps('nftDescription')}
                error={Boolean(touched.nftDescription && errors.nftDescription)}
              />
              <TextField
                color="secondary"
                label="Author*"
                {...getFieldProps('author')}
                error={Boolean(touched.author && errors.author)}
              />
              <Autocomplete
                multiple
                freeSolo
                value={values.tags}
                onChange={(event, newValue) => {
                  setFieldValue('tags', newValue);
                }}
                options={TAGS_OPTION.map((option) => option)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    label="Tags*"
                    error={Boolean(touched.tags && errors.tags)}
                    {...params}
                  />
                )}
              />

              <Stack direction="row" spacing={5}>
                <Button
                  variant="contained"
                  fullWidth
                  color="error"
                  onClick={() => {
                    setOpenCreateNftDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                >
                  {'Save'}
                </LoadingButton>
              </Stack>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  );
}
