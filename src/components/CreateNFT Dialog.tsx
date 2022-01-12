import React, { useState } from 'react';
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

type Props = {
  openCreateNftDialog: boolean;
  setOpenCreateNftDialog: Function;
};

const TAGS_OPTION = ['Art'];

export default function CreateNFTDialog({ openCreateNftDialog, setOpenCreateNftDialog }: Props) {
  const NewProductSchema = Yup.object().shape({
    nftName: Yup.string().required('Name is required'),
    nftDescription: Yup.string().required('Description is required'),
    author: Yup.string().required('Author is required'),
    tags: Yup.array().min(1, 'Tags are required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nftName: '',
      nftDescription: '',
      author: '',
      tags: [TAGS_OPTION[0]],
    },
    validationSchema: NewProductSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      console.log('SBUMIT');
      await new Promise((resolve) => setTimeout(resolve, 500));

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
