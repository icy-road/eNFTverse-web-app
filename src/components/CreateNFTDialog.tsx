import React, { useCallback, useState } from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, LoadingButton } from '@mui/lab';
import UploadSingleFile from './UploadSingleFile';
import { generateIPFSMetadataHash } from '../api/ApiClient';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import Web3 from 'web3';
import {COLLECTIONS, CONTRACT_ADDRESS, EXPLORER_URL, WEB3_PROVIDER} from '../api/config';

type Props = {
  openCreateNftDialog: boolean;
  setOpenCreateNftDialog: Function;
  metamaskAddress: string;
};

const TAGS_OPTION = ['Art'];

const nftContractABI = require('../utils/NFTContract.json');

export default function CreateNFTDialog({
  openCreateNftDialog,
  setOpenCreateNftDialog,
  metamaskAddress,
}: Props) {
  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const nftContractAddress = COLLECTIONS[0].address;

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const { library } = useWeb3React<Web3Provider>();

  const NewProductSchema = Yup.object().shape({
    nftName: Yup.string().required('Name is required'),
    nftDescription: Yup.string().required('Description is required'),
    author: Yup.string().required('Author is required'),
    tags: Yup.array().min(1, 'Tags are required'),
    base64: Yup.string().required('Image is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nftName: '',
      nftDescription: '',
      author: '',
      tags: [TAGS_OPTION[0]],
      image: null,
      base64: '',
    },
    validationSchema: NewProductSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      if (library) {
        generateIPFSMetadataHash(values).then(async ({ data }) => {
          setSubmitting(true);
          setMinting(true);
          const sender = metamaskAddress;

          const mintToEncodedAbi = await nftContract.methods
            .mintTo(sender, data.ipfsMetadataHash)
            .encodeABI();

          const params = {
            from: sender,
            to: nftContractAddress,
            data: mintToEncodedAbi,
          };
          await library.estimateGas(params);

          // @ts-ignore
          await window.ethereum.enable();
          // @ts-ignore
          window.web3 = new Web3(window.ethereum);

          // @ts-ignore
          window.web3.eth
            .sendTransaction(params)
            .on('transactionHash', async (txHash: any) => {
              console.log('txHash:');
              console.log(txHash);
              window.open(`${EXPLORER_URL}/tx/${txHash}/`);
              resetForm();
              setOpenCreateNftDialog(false);
              setMinting(false);
            })
            .catch((err: any) => {
              console.log(err);
              setMinting(false);
              setMintingError({
                value: true,
                message: err && err.message ? err.message : 'Unknown error',
              });
            });
        });
      }
    },
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { errors, values, touched, handleSubmit, setFieldValue, getFieldProps, resetForm } = formik;

  const [minting, setMinting] = useState(false);
  const [mintingError, setMintingError] = useState({
    value: false,
    message: '',
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const reader = new FileReader();
      reader.readAsDataURL(acceptedFiles[0]);
      reader.onload = function () {
        setFieldValue('base64', dataURItoBlob(reader.result));
      };

      setFieldValue('image', acceptedFiles[0]);
    },
    [setFieldValue]
  );

  return (
    <Dialog
      fullWidth={true}
      fullScreen={fullScreen}
      open={openCreateNftDialog}
      onClose={() => {
        if (!minting) {
          resetForm();
          setOpenCreateNftDialog(false);
        }
      }}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        <Typography variant="h5">{'Create NFT'}</Typography>
      </DialogTitle>
      <DialogContent>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={6000}
          open={mintingError.value}
          onClose={() => {
            setMintingError({
              value: false,
              message: '',
            });
          }}
        >
          <Alert severity="error">{mintingError.message}</Alert>
        </Snackbar>
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
                error={Boolean(touched.base64 && errors.base64)}
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
                {!minting ? (
                  <Button
                    variant="contained"
                    fullWidth
                    color="error"
                    onClick={() => {
                      resetForm();
                      setOpenCreateNftDialog(false);
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  ''
                )}
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  loading={minting}
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

function dataURItoBlob(dataURI: any) {
  var byteString = atob(dataURI.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var bb = new Blob([ab], { type: 'image/jpg' });
  return bb;
}
